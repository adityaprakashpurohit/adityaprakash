import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroCanvasProps {
  src: string;
  thumbs: string[];
  anchorRef: React.RefObject<HTMLImageElement | null>;
  play: boolean;
  label?: string;
  className?: string;
}

const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 aHome;   // 0..1 inside the anchor rect
in vec3 aAir;    // x,y 0..1 over the canvas, z = depth (0 near, 1 far)
in vec4 aInfo;   // brightness, delay, duration, phase
in vec3 aCell;   // atlas window origin (uv), kind (0 tile, 1 dust)

uniform vec2 uRes;       // canvas, CSS px
uniform vec4 uRect;      // anchor x, y, w, h in canvas CSS px
uniform float uCell;     // tile pitch, CSS px
uniform float uDpr;
uniform float uTime;     // seconds, always running
uniform float uReveal;   // seconds since play
uniform float uScatter;  // 0 = face, 1 = blown back into the air
uniform vec2 uMouse;     // CSS px, far away when absent

out vec2 vCell;
out float vBright;
out float vLand;
out float vAlpha;
out float vPhase;

float inOut(float t) { return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0) / 2.0; }

void main() {
  float bright = aInfo.x;
  float delay  = aInfo.y;
  float dur    = aInfo.z;
  float phase  = aInfo.w;
  float depth  = aAir.z;
  bool dust    = aCell.z > 0.5;

  vec2 drift = vec2(sin(uTime*0.31 + phase*6.283), cos(uTime*0.23 + phase*9.1))
             * (6.0 + 22.0*(1.0 - depth));
  vec2 air  = aAir.xy * uRes + drift;
  vec2 home = uRect.xy + aHome * uRect.zw;

  float appear = smoothstep(0.0, 0.8, uReveal - delay*0.35);
  float fly    = dust ? 0.0 : clamp((uReveal - delay) / dur, 0.0, 1.0);
  float e      = inOut(fly);

  float q = clamp(uScatter*1.7 - phase*0.7, 0.0, 1.0);
  q = q*q;

  float k = e * (1.0 - q);
  vec2 pos = mix(air, home, k);

  vec2 d = home - air;
  pos += vec2(-d.y, d.x) * 0.18 * sin(3.14159*k) * (phase - 0.5);

  vec2 m = pos - uMouse;
  float ml = length(m);
  pos += (ml > 0.001 ? m/ml : vec2(0.0)) * smoothstep(110.0, 0.0, ml) * 16.0 * k;

  float land  = smoothstep(0.55, 1.0, k);
  float speck = mix(2.2, 0.9, depth);
  float tile  = uCell * (0.25 + 0.7*bright);
  float size  = mix(speck, tile, land);

  float dustA = dust ? mix(0.55, 0.22, smoothstep(2.0, 4.0, uReveal)) : 1.0;
  vAlpha  = appear * mix(0.25 + 0.55*(1.0 - depth), 1.0, land) * dustA;
  vBright = bright;
  vLand   = land;
  vCell   = aCell.xy;
  vPhase  = phase;

  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position  = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = max(size * uDpr, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uAtlas;
uniform vec2 uWin;
uniform float uTime;

in vec2 vCell;
in float vBright;
in float vLand;
in float vAlpha;
in float vPhase;
out vec4 outColor;

void main() {
  vec3 c = texture(uAtlas, vCell + gl_PointCoord * uWin).rgb;
  float peak = max(max(c.r, c.g), max(c.b, 0.06));
  vec3 hue = c / peak;
  vec3 tile = mix(hue, min(c * 1.8, 1.0), 0.35);
  tile = mix(tile, vec3(1.0), 0.15);
  float twinkle = 0.9 + 0.1*sin(uTime*1.6 + vPhase*47.0);
  tile *= (0.1 + 0.95*vBright) * twinkle;

  vec3 speck = vec3(0.9, 0.92, 1.0);
  vec3 rgb = mix(speck, tile, vLand);
  outColor = vec4(rgb * vAlpha, vAlpha);
}
`;

const ATLAS_WIDTH = 1024;
const ATLAS_HEIGHT = 640;
const TILE_WINDOW = 56;
const DUST_RATIO = 0.07;

const CROP_BOXES = [
  [0.26, 0.17, 0.48, 0.37],
  [0.53, 0.08, 0.15, 0.55],
  [0.4, 0.14, 0.16, 0.72],
  [0.2, 0.22, 0.4, 0.4],
];

const getCellPitch = (width: number) => Math.min(6, Math.max(3.5, width / 200));

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Shader creation failed');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compile failed');
  }
  return shader;
}

function buildAtlas(images: HTMLImageElement[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_WIDTH;
  canvas.height = ATLAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  const halfW = ATLAS_WIDTH / 2;
  const halfH = ATLAS_HEIGHT / 2;

  images.slice(0, 4).forEach((img, i) => {
    const [cx, cy, cw, ch] = CROP_BOXES[i] ?? [0, 0, 1, 1];
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    ctx.drawImage(
      img,
      cx * iw,
      cy * ih,
      cw * iw,
      ch * ih,
      (i % 2) * halfW,
      Math.floor(i / 2) * halfH,
      halfW,
      halfH
    );
  });
  return canvas;
}

function smoothstepQuintic(min: number, max: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

function samplePortrait(img: HTMLImageElement, width: number, revealCutoff: number) {
  const cell = getCellPitch(width);
  const cols = Math.max(20, Math.round(width / cell));
  const rows = Math.round((cols * img.naturalHeight) / img.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, cols, rows);

  const data = ctx.getImageData(0, 0, cols, rows).data;
  const homes: number[] = [];
  const airs: number[] = [];
  const infos: number[] = [];
  const cellAttrs: number[] = [];
  const stepX = TILE_WINDOW / ATLAS_WIDTH;
  const stepY = TILE_WINDOW / ATLAS_HEIGHT;
  let maxSettle = 0;

  const addPoint = (x: number, y: number, brightness: number, isDust: boolean) => {
    homes.push(x, y);
    airs.push(Math.random() * 1.2 - 0.1, Math.random() * 1.2 - 0.1, Math.random());
    const delay = 0.35 + Math.random() * 1 + y * 0.45;
    const dur = 1.35 + Math.random() * 0.55;
    if (!isDust) maxSettle = Math.max(maxSettle, delay + dur);
    infos.push(brightness, delay, dur, Math.random());
    cellAttrs.push(Math.random() * (1 - stepX), Math.random() * (1 - stepY), +isDust);
  };

  const luminance = new Float32Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    const idx = i * 4;
    luminance[i] =
      ((0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2]) / 255) *
      (data[idx + 3] / 255);
  }

  const activeVals = Array.from(luminance).filter((v) => v >= 0.035).sort((a, b) => a - b);
  const low = activeVals[Math.floor(activeVals.length * 0.02)] ?? 0;
  const high = activeVals[Math.floor(activeVals.length * 0.97)] ?? 1;
  const maxRow = Math.min(rows, Math.ceil(rows * revealCutoff));

  for (let r = 0; r < maxRow; r++) {
    for (let c = 0; c < cols; c++) {
      const val = luminance[r * cols + c];
      if (val < 0.035 || (val < 0.08 && Math.random() < 0.45)) continue;
      const normalized = Math.min(1, Math.max(0, (val - low) / (high - low)));
      const bright = 0.2 * normalized + 0.8 * smoothstepQuintic(0.1, 0.55, normalized);
      addPoint((c + 0.5) / cols, (r + 0.5) / rows, bright, false);
    }
  }

  const numTiles = homes.length / 2;
  const dustCount = Math.round(numTiles * DUST_RATIO);
  for (let i = 0; i < dustCount; i++) {
    addPoint(0.5, 0.5, 0.3, true);
  }

  return {
    settle: maxSettle,
    cell,
    count: homes.length / 2,
    home: new Float32Array(homes),
    air: new Float32Array(airs),
    info: new Float32Array(infos),
    cellAttr: new Float32Array(cellAttrs),
  };
}

export const HeroCanvas: React.FC<HeroCanvasProps> = ({
  src,
  thumbs,
  anchorRef,
  play,
  label,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (play && startTimeRef.current === null) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      startTimeRef.current = performance.now() / 1000 - (reduced ? 100 : 0);
    }
  }, [play]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    if (!canvas || !anchor) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });

    const fallback = () => {
      anchor.style.visibility = 'visible';
      canvas.style.display = 'none';
    };

    if (!gl) return fallback();

    let unmounted = false;
    let isTicking = false;
    let isIntersecting = true;
    let pointCount = 0;
    let tileCell = 6;
    let settleTime = 0;

    let cachedWidth = -1;
    let portraitImg: HTMLImageElement | null = null;
    const baseTime = performance.now() / 1000;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasPointer = window.matchMedia('(pointer: fine)').matches;

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? 'Link failure');
      }
    } catch (err) {
      console.error(err);
      return fallback();
    }

    gl.useProgram(program);
    const getUniform = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      res: getUniform('uRes'),
      rect: getUniform('uRect'),
      cell: getUniform('uCell'),
      dpr: getUniform('uDpr'),
      time: getUniform('uTime'),
      reveal: getUniform('uReveal'),
      scatter: getUniform('uScatter'),
      mouse: getUniform('uMouse'),
      atlas: getUniform('uAtlas'),
      win: getUniform('uWin'),
    };

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    const buffers = ['aHome', 'aAir', 'aInfo', 'aCell'].map((name, i) => {
      const buf = gl.createBuffer()!;
      const loc = gl.getAttribLocation(program, name);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, [2, 3, 4, 3][i], gl.FLOAT, false, 0, 0);
      return buf;
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2f(uniforms.win, TILE_WINDOW / ATLAS_WIDTH, TILE_WINDOW / ATLAS_HEIGHT);

    const updateGeometry = () => {
      const aRect = anchor.getBoundingClientRect();
      const w = aRect.width;
      if (!portraitImg || w < 10 || Math.abs(w - cachedWidth) < 1) return;
      cachedWidth = w;

      const cRect = canvas.getBoundingClientRect();
      const cutoff = Math.max(0, Math.min(1, (cRect.bottom - aRect.top) / aRect.height));
      const sample = samplePortrait(portraitImg, w, cutoff);

      pointCount = sample.count;
      tileCell = sample.cell;
      settleTime = sample.settle;

      [sample.home, sample.air, sample.info, sample.cellAttr].forEach((arr, i) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      });
    };

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
      if (mouse.x < -999) {
        mouse.x = mouse.tx;
        mouse.y = mouse.ty;
      }
    };
    const onPointerLeave = () => {
      mouse.tx = mouse.ty = -9999;
      mouse.x = mouse.y = -9999;
    };

    const render = () => {
      if (!pointCount || startTimeRef.current === null) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const pixelW = Math.round(rect.width * dpr);
      const pixelH = Math.round(rect.height * dpr);

      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
      updateGeometry();

      const aRect = anchor.getBoundingClientRect();
      const now = performance.now() / 1000;
      const scatter = reducedMotion ? 0 : Math.min(1, Math.max(0, -rect.top / (rect.height * 0.7)));

      mouse.x += (mouse.tx - mouse.x) * 0.18;
      mouse.y += (mouse.ty - mouse.y) * 0.18;

      gl.viewport(0, 0, pixelW, pixelH);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uniforms.res, rect.width, rect.height);
      gl.uniform4f(uniforms.rect, aRect.left - rect.left, aRect.top - rect.top, aRect.width, aRect.height);
      gl.uniform1f(uniforms.cell, tileCell);
      gl.uniform1f(uniforms.dpr, dpr);
      gl.uniform1f(uniforms.time, now - baseTime);
      gl.uniform1f(uniforms.reveal, now - startTimeRef.current);
      gl.uniform1f(uniforms.scatter, scatter);
      gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);

      gl.drawArrays(gl.POINTS, 0, pointCount);
    };

    const setTicker = (active: boolean) => {
      if (active !== isTicking) {
        isTicking = active;
        if (active) gsap.ticker.add(render);
        else gsap.ticker.remove(render);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      setTicker(isIntersecting && pointCount > 0);
    });
    observer.observe(canvas);

    Promise.all([loadImage(src), Promise.all(thumbs.map(loadImage))])
      .then(([portrait, thumbImgs]) => {
        if (unmounted) return;
        portraitImg = portrait;
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildAtlas(thumbImgs));
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(uniforms.atlas, 0);
        updateGeometry();
        setTicker(isIntersecting && pointCount > 0);
      })
      .catch((e) => {
        console.error(e);
        fallback();
      });

    if (hasPointer) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      unmounted = true;
      setTicker(false);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, [src, thumbs, anchorRef]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
};

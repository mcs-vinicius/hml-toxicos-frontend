import React, { useRef, useEffect } from 'react';

// Os shaders são definidos como strings de template literais dentro do arquivo.
const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;
  uniform float u_time;

  vec3 palette2(float t, float factor) {
      vec3 a = vec3(0.5) + 0.3 * sin(vec3(0.1, 0.3, 0.5) * factor);
      vec3 b = vec3(0.5) + 0.3 * cos(vec3(0.2, 0.4, 0.6) * factor);
      vec3 c = vec3(1.0) + 0.5 * sin(vec3(0.3, 0.7, 0.9) * factor);
      vec3 d = vec3(0.25, 0.4, 0.55) + 0.2 * cos(vec3(0.5, 0.6, 0.7) * factor);
      return a + b * cos(6.28318 * (c * t + d));
  }
  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                 u.y);
  }

  void main() {
      vec2 st = gl_FragCoord.xy/u_resolution.xy;
      st.x *= u_resolution.x/u_resolution.y;
      vec3 color = vec3(0.0);
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
      uv.x = abs(uv.x);
      float breath = 1.0 + 2.0 * sin(u_time * 0.15) * smoothstep(0.2, 1.5, length(uv));
      uv *= breath;
      uv *= 20.0;

  for (int i = 0; i < 30; i++) {
      float t = u_time * 0.01 - float(i);
      uv *= mat2(cos(t), sin(t), -sin(t), cos(t));
      uv += noise(sin(uv) * 0.6);
      uv += noise(-cos(uv) * 0.6);

      color += 0.002 / length(uv + sin(t));
      
      float intensity = 0.1 / length(uv - (10.3) * sin(t)) * (length(uv) * sin(float(i) + u_time));
      
      color += palette2(float(i) / u_time, u_time * 0.5) * intensity;
  }

  gl_FragColor = vec4(color, 1.0);
  }
`;

const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error("WebGL não é suportado pelo seu navegador.");
      return;
    }

    // Funções auxiliares para criar shaders e o programa
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Erro ao compilar o shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Erro ao linkar o programa:', gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // Configuração do buffer de posição para um retângulo que cobre a tela
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    // Obtenção das localizações dos uniforms
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    
    let animationFrameId;

    // Função de renderização principal
    const render = (time) => {
      const startOffset = 20.0;
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time * 0.001 + startOffset);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    // Função para redimensionar o canvas
    const resize = () => {
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
      canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      // As propriedades de estilo são gerenciadas pelo CSS do componente
    };
    
    window.addEventListener('resize', resize);
    resize(); // Chama uma vez para definir o tamanho inicial
    requestAnimationFrame(render);

    // Função de limpeza: será executada quando o componente for desmontado
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez (na montagem)

  // Estilos para fazer o canvas cobrir toda a tela, por trás de outro conteúdo
  const canvasStyle = {
    marginTop:'40px',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '450px',
    zIndex: -1, // Garante que o canvas fique no fundo
    overflow: 'hidden',
  };

  return <canvas ref={canvasRef} style={canvasStyle} />;
};

export default Background;
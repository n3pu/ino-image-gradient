import React, { useRef, useEffect, useState } from 'react';

interface Point {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
}

const CanvasComponent: React.FC = () => {
  const radiusValue = 550;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([
    { id:1, x: Math.random() * 300 + 50, y: Math.random() * 100 + 50, radius: radiusValue, color: '#FF0000' },
    { id:2, x: Math.random() * 300 + 150, y: Math.random() * 100 + 150, radius: radiusValue, color: '#00FF00' },
    { id:3, x: Math.random() * 300 + 250, y: Math.random() * 100 + 300, radius: radiusValue, color: '#0000FF' },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const draw = (ctx: CanvasRenderingContext2D, withClickablePoints: boolean = true) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    points.forEach((point) => {
      // Desenha o gradiente radial primeiro
      const gradient = ctx.createRadialGradient(point.x, point.y, 5, point.x, point.y, point.radius);
      gradient.addColorStop(0, point.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();

    });

    if (withClickablePoints) {
      points.forEach((point) => {
        // Desenha o círculo clicável na camada superior
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Desenha o número no centro do ponto clicável
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(point.id.toString(), point.x, point.y);
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        draw(ctx);
      }
    }
  }, [points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const handleResize = () => {
        const height = window.innerHeight - 32;
        const width = height; // Largura proporcional à altura
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          draw(ctx);
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const pointIndex = points.findIndex(
      (point) =>
        Math.sqrt((point.x - offsetX) ** 2 + (point.y - offsetY) ** 2) < 10
    );

    if (pointIndex !== -1) {
      setDraggingIndex(pointIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIndex !== null) {
      const { offsetX, offsetY } = e.nativeEvent;
      setPoints((prevPoints) =>
        prevPoints.map((point, index) =>
          index === draggingIndex ? { ...point, x: offsetX, y: offsetY } : point
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };
  
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        draw(ctx, false); // Desenhar sem os pontos clicáveis
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'ino-image-gradient.png';
        link.click();
        draw(ctx); // Redesenhar com os pontos clicáveis
      }
    }
  };

  const changeColor = (id: number, color: string) => {
    setPoints(points.map(point => 
      point.id === id ? { ...point, color } : point
    ));
  };

  const addPoint = () => {
    const newPoint: Point = {
      id: points.length + 1,
      x: Math.random() * 300 + 50,
      y: Math.random() * 100 + 50,
      radius: radiusValue,
      color: '#000000',
    };
    setPoints([...points, newPoint]);
  };

  const removePoint = (id: number) => {
    setPoints(points.filter(point => point.id !== id));
  };

  return (
    <div className='canvas-container'>
      <div className='canvas'>
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ 
            boxShadow: '0px 0px 8px #000', 
            backgroundColor: '#FFF',
            borderRadius: '8px',
          }}
        />
      </div>
      <div className='dots-control'>
        {points.map((point) => (
          <div key={point.id}>
            <label className='dot-label'>
              {point.id}:
              <input
                type="color"
                value={point.color}
                onChange={(e) => changeColor(point.id, e.target.value)}
              />
              <button onClick={() => removePoint(point.id)}>-</button>
            </label>
          </div>
        ))}
        <button onClick={addPoint}>+</button>
        <button onClick={downloadImage} style={{width: '100%', marginTop: '8px'}}>Download</button>
      </div>
    </div>
  );
};

export default CanvasComponent;

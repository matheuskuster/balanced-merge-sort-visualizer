import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

const MultiwayMerge = () => {
  const [numArrays, setNumArrays] = useState(4);
  const [arraySize, setArraySize] = useState(4);
  
  const generateInitialArrays = useCallback(() => {
    const arrays = [];
    let currentNum = 1;
    
    for (let i = 0; i < numArrays; i++) {
      const array = [];
      for (let j = 0; j < arraySize; j++) {
        array.push(currentNum);
        currentNum++;
      }
      arrays.push(array.sort((a, b) => a - b));
    }
    return arrays;
  }, [numArrays, arraySize]);

  const [files, setFiles] = useState(() => generateInitialArrays());
  const [output, setOutput] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMin, setCurrentMin] = useState<number | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [speed, setSpeed] = useState(500);
  
  const findSmallestValue = useCallback((currentFiles: number[][]) => {
    let smallestValue = Infinity;
    let smallestIndex = -1;

    currentFiles.forEach((file, index) => {
      if (file.length > 0 && file[0] < smallestValue) {
        smallestValue = file[0];
        smallestIndex = index;
      }
    });

    return { smallestValue, smallestIndex };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const mergeStep = async () => {
      if (!isRunning) return;

      const activeFiles = files.filter(file => file.length > 0).length;
      
      if (activeFiles === 0) {
        setIsRunning(false);
        setCurrentMin(null);
        setActiveFileIndex(null);
        return;
      }

      const firstValues = files.map((file, index) => ({
        value: file.length > 0 ? file[0] : Infinity,
        index
      })).filter(item => item.value !== Infinity);

      for (let i = 0; i < firstValues.length; i++) {
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, speed);
        });
        setActiveFileIndex(firstValues[i].index);
        setCurrentMin(firstValues[i].value);
      }

      const { smallestValue, smallestIndex } = findSmallestValue(files);
      
      if (smallestIndex !== -1) {
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, speed);
        });

        const newFiles = files.map((file, index) => 
          index === smallestIndex ? file.slice(1) : file
        );
        
        const newOutput = [...output, smallestValue];
        
        setFiles(newFiles);
        setOutput(newOutput);
      }

      await new Promise<void>(resolve => {
        timeoutId = setTimeout(() => {
          setCurrentMin(null);
          setActiveFileIndex(null);
          resolve();
        }, speed);
      });
    };

    if (isRunning) {
      mergeStep();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [files, output, isRunning, findSmallestValue, speed]);

  const handleReset = useCallback(() => {
    setFiles(generateInitialArrays());
    setOutput([]);
    setIsRunning(false);
    setCurrentMin(null);
    setActiveFileIndex(null);
  }, [generateInitialArrays]);

  const handleConfigUpdate = useCallback(() => {
    handleReset();
  }, [handleReset]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Visualização de Intercalação Múltipla</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Número de Arquivos (2-8)
                </label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={numArrays}
                  onChange={(e) => setNumArrays(Math.min(8, Math.max(2, parseInt(e.target.value) || 2)))}
                  className="w-full p-2 border rounded"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tamanho dos Arquivos (2-8)
                </label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={arraySize}
                  onChange={(e) => setArraySize(Math.min(8, Math.max(2, parseInt(e.target.value) || 2)))}
                  className="w-full p-2 border rounded"
                  disabled={isRunning}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Velocidade da Animação (ms): {speed}
              </label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={100}
                max={1000}
                step={100}
                className="w-full"
                disabled={isRunning}
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`px-4 py-2 rounded ${
                  isRunning 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {isRunning ? 'Pausar' : 'Iniciar'}
              </button>
              <button 
                onClick={handleReset}
                className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
              >
                Reiniciar
              </button>
              <button 
                onClick={handleConfigUpdate}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
                disabled={isRunning}
              >
                Aplicar Configuração
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg bg-white shadow transition-all duration-300 ${
                    activeFileIndex === index ? 'border-blue-500' : ''
                  }`}
                >
                  <div className="font-bold mb-2">Arquivo {index + 1}</div>
                  <div className="text-sm">
                    {file.map((num, idx) => (
                      <span 
                        key={idx}
                        className={`${
                          idx === 0 && activeFileIndex === index
                            ? 'bg-yellow-200 font-bold'
                            : ''
                        } ${
                          idx === 0 && num === currentMin
                            ? 'bg-green-200 font-bold'
                            : ''
                        }`}
                      >
                        {num}
                        {idx < file.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 border-2 border-blue-500 rounded-lg">
              <div className="font-bold mb-2">Arquivo de Saída</div>
              <div className="text-lg">
                {output.map((num, index) => (
                  <span 
                    key={index}
                    className={`${
                      index === output.length - 1 ? 'bg-green-200 font-bold' : ''
                    }`}
                  >
                    {num}
                    {index < output.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>

            <Legend />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Legend = () => (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    <div className="font-bold mb-2">Legenda:</div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 border-2 border-blue-500"></div>
        <span>Arquivo sendo analisado</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-yellow-200"></div>
        <span>Número em comparação</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-200"></div>
        <span>Menor número encontrado</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-200"></div>
        <span>Último número adicionado à saída</span>
      </div>
    </div>
  </div>
);

export default MultiwayMerge;
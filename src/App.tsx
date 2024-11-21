import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const BalancedMergeSort = () => {
  // Estado inicial dos arquivos
  const initialFiles = [
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [4, 8, 12, 16]
  ];

  // Estados
  const [files, setFiles] = useState(initialFiles);
  const [output, setOutput] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMin, setCurrentMin] = useState<number | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  
  // Encontra o menor valor entre os arquivos ativos
  const findSmallestValue = useCallback((currentFiles: typeof files) => {
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

  // Processo principal de intercalação
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

      // Primeiro, destaca os números sendo comparados
      const firstValues = files.map((file, index) => ({
        value: file.length > 0 ? file[0] : Infinity,
        index
      })).filter(item => item.value !== Infinity);

      // Simula o processo de comparação
      for (let i = 0; i < firstValues.length; i++) {
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 500);
        });
        setActiveFileIndex(firstValues[i].index);
        setCurrentMin(firstValues[i].value);
      }

      // Encontra o menor valor
      const { smallestValue, smallestIndex } = findSmallestValue(files);
      
      if (smallestIndex !== -1) {
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, 500);
        });

        // Atualiza os arquivos removendo o menor valor
        const newFiles = files.map((file, index) => 
          index === smallestIndex ? file.slice(1) : file
        );
        
        // Atualiza o output adicionando o menor valor
        const newOutput = [...output, smallestValue];
        
        setFiles(newFiles);
        setOutput(newOutput);
      }

      // Limpa os destaques antes do próximo passo
      await new Promise<void>(resolve => {
        timeoutId = setTimeout(() => {
          setCurrentMin(null);
          setActiveFileIndex(null);
          resolve();
        }, 500);
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
  }, [files, output, isRunning, findSmallestValue]);

  // Reinicia a visualização
  const handleReset = () => {
    setFiles(initialFiles);
    setOutput([]);
    setIsRunning(false);
    setCurrentMin(null);
    setActiveFileIndex(null);
  };

  // Inicia/Pausa a visualização
  const handleToggleRunning = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Intercalação balanceada: Múltiplos caminhos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controles */}
            <div className="flex gap-2">
              <button 
                onClick={handleToggleRunning}
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
            </div>

            {/* Arquivos de entrada */}
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

            {/* Arquivo de saída */}
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

export default BalancedMergeSort;
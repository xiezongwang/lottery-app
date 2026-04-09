import { useState } from 'react';
import { Users, Upload, Download, Trash2 } from 'lucide-react';

interface NameListProps {
  participants: string[];
  onSetParticipants: (names: string[]) => void;
}

export default function NameList({ participants, onSetParticipants }: NameListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setTextContent(participants.join('\n'));
  };

  const handleSave = () => {
    const names = textContent.split('\n').filter(n => n.trim());
    onSetParticipants(names);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTextContent('');
  };

  const handleClear = () => {
    if (confirm('确定要清空所有参与者吗？')) {
      onSetParticipants([]);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const names = content.split('\n').filter(n => n.trim());
          onSetParticipants(names);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const content = participants.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gold flex items-center gap-2">
          <Users className="w-6 h-6" />
          参与者名单
          <span className="text-sm text-white/60 font-normal">
            ({participants.length} 人)
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="导入"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            disabled={participants.length === 0}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="导出"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={participants.length === 0}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
            title="清空"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isEditing ? (
        <div
          onClick={handleEdit}
          className="max-h-[300px] overflow-y-auto text-white/70 whitespace-pre-wrap cursor-pointer hover:bg-white/5 rounded-lg p-4 transition-colors"
        >
          {participants.length > 0 ? (
            participants.map((name, index) => (
              <div key={index} className="py-1">
                {index + 1}. {name}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/40">
              点击此处添加参与者
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="每行输入一个姓名..."
            className="input min-h-[200px] resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 btn-primary"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-lg transition-all"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

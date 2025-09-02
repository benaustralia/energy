import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { getBadgeColor } from '@/lib/energyUtils';

interface Student {
  name: string;
  score: number;
}

interface StudentRowProps {
  name: string;
  i: number;
  isStage2?: boolean;
  student?: Student;
  editIndex: number;
  editValue: string;
  setEditIndex: (index: number) => void;
  setEditValue: (value: string) => void;
  handleEdit: (action: 'save' | 'cancel') => void;
  openScoreDialog: (index: number) => void;
  setHoveredStudent: (name: string) => void;
  setNames: React.Dispatch<React.SetStateAction<string[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  getFontForName: (name: string) => string;
  getEmojiForName: (name: string) => string;
}

export const StudentRow = ({
  name,
  i,
  isStage2,
  student,
  editIndex,
  editValue,
  setEditIndex,
  setEditValue,
  handleEdit,
  openScoreDialog,
  setHoveredStudent,
  setNames,
  setStudents,
  getFontForName,
  getEmojiForName
}: StudentRowProps) => {
  const currentStudent = isStage2 ? student : { name, score: 0 };
  
  return (
    <div key={i} className="flex items-center gap-3 min-w-0">
      <Card className="flex-1 min-w-0">
        <CardContent className="flex items-center justify-between p-3 min-h-[40px]">
          {editIndex === i ? (
            <>
              <Input 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)} 
                onKeyDown={(e) => 
                  e.key === 'Enter' ? handleEdit('save') : 
                  e.key === 'Escape' ? handleEdit('cancel') : null
                } 
                className="flex-1 mr-2 text-sm" 
                autoFocus 
              />
              <div className="flex space-x-1 shrink-0">
                <Button onClick={() => handleEdit('save')} size="sm">✓</Button>
                <Button onClick={() => handleEdit('cancel')} size="sm" variant="outline">✕</Button>
              </div>
            </>
          ) : (
            <>
              <span 
                {...(isStage2 ? {
                  onClick: () => openScoreDialog(i),
                  onMouseEnter: () => setHoveredStudent(currentStudent?.name || ''),
                  className: `font-bold text-2xl cursor-pointer hover:opacity-75 whitespace-nowrap ${getFontForName(currentStudent?.name || '')}`
                } : {
                  className: `font-bold text-2xl whitespace-nowrap ${getFontForName(name)}`
                })}
              >
                {getEmojiForName(currentStudent?.name || name)} {currentStudent?.name || name}
              </span>
              <div className="flex space-x-1 shrink-0 ml-4">
                <Button 
                  onClick={() => {
                    setEditIndex(i); 
                    setEditValue(currentStudent?.name || name);
                  }} 
                  size="sm" 
                  variant="outline"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button 
                  onClick={() => 
                    isStage2 ? (
                      setStudents(prev => prev.filter((_, idx) => idx !== i)),
                      setNames(prev => prev.filter((_, idx) => idx !== i))
                    ) : setNames(prev => prev.filter((_, idx) => idx !== i))
                  } 
                  size="sm" 
                  variant="outline"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {currentStudent && currentStudent.score > 0 ? (
        <Badge className={`min-w-[3rem] h-10 flex items-center justify-center text-lg font-bold shrink-0 text-white ${getBadgeColor(currentStudent.score)}`}>
          {currentStudent.score}
        </Badge>
      ) : (
        <div className="min-w-[3rem] h-10 shrink-0"></div>
      )}
    </div>
  );
};

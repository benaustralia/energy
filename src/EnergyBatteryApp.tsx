import { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Dialog from '@radix-ui/react-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import AudioManager from '@/components/AudioManager';

const FONTS = ['font-fredoka', 'font-kalam', 'font-baloo'];
const EMOJIS = ['✨', '🌟', '💫', '⭐', '🌙', '☀️', '🌈', '⚡', '🔥', '💎', '🎯', '🎨', '🎭', '🎪', '🎵', '🎸', '🎤', '🎬', '📸', '🚀', '🛸', '🌍', '🌊', '🏔️', '🌋', '🗿', '🎲', '🔮', '🪄', '💝', '🎁', '🎈', '🎉', '🎊', '🏆', '🥇', '👑', '💰', '🪙', '🔑', '🗝️', '🧩', '🎯', '🎪', '🎨', '🎭', '🎵', '🎸', '🎤'];

export default function EnergyBatteryApp() {
  const [step, setStep] = useState(1), [input, setInput] = useState(''), [names, setNames] = useState<string[]>([]), [students, setStudents] = useState<{ name: string; score: number }[]>([]), [editIndex, setEditIndex] = useState(-1), [editValue, setEditValue] = useState(''), [animatingName, setAnimatingName] = useState(''), [scoreDialogOpen, setScoreDialogOpen] = useState(false), [selectedStudentIndex, setSelectedStudentIndex] = useState(-1), [tempScore, setTempScore] = useState(''), [hoveredStudent, setHoveredStudent] = useState<string>('');
  const audioRef = useRef<any>(null), nameFontsRef = useRef<{ [key: string]: string }>({});
  const usedEmojisRef = useRef<Set<string>>(new Set());
  
  const getFontForName = (name: string) => nameFontsRef.current[name] ||= FONTS[name.toLowerCase().trim().split('').reduce((a, b) => a + b.charCodeAt(0), 0) % FONTS.length];
  const getEmojiForName = (name: string) => {
    if (!nameFontsRef.current[`emoji_${name}`]) {
      const allNames = [...names, ...students.map(s => s.name)].filter(n => n !== name);
      const availableEmojis = EMOJIS.filter(emoji => !allNames.some(otherName => getStoredEmojiForName(otherName) === emoji));
      const hash = name.toLowerCase().trim().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      nameFontsRef.current[`emoji_${name}`] = availableEmojis[hash % availableEmojis.length] || EMOJIS[hash % EMOJIS.length];
    }
    return nameFontsRef.current[`emoji_${name}`];
  };
  const getStoredEmojiForName = (name: string) => nameFontsRef.current[`emoji_${name}`];
  const average = useMemo(() => { const validScores = students.filter(s => s.score > 0); return validScores.length ? validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length : 0; }, [students]);
  const allStudentsHave7 = useMemo(() => { const validScores = students.filter(s => s.score > 0); return validScores.length === students.length && validScores.every(s => s.score === 7); }, [students]);
  const getColor = (level: number) => level <= 6 ? '#f97316' : level === 7 ? '#22c55e' : '#ef4444';
  const getBadgeColor = (score: number) => score >= 1 && score <= 6 ? 'bg-orange-500' : score === 7 ? 'bg-green-500' : score >= 8 && score <= 10 ? 'bg-red-500' : 'bg-gray-500';

  const audioManager = AudioManager({}); audioRef.current = audioManager;
  const playSound = async (notes?: string[]) => audioRef.current?.playSound(notes);
  const playBeepBoop = async () => audioRef.current?.playBeepBoop();
  const handleEdit = (action: 'save' | 'cancel') => { if (action === 'save' && editValue.trim()) { setNames(prev => prev.map((n, idx) => idx === editIndex ? editValue.trim() : n)); setStudents(prev => prev.map((s, idx) => idx === editIndex ? { ...s, name: editValue.trim() } : s)); } setEditIndex(-1); setEditValue(''); };
  const addName = async () => { if (!input.trim()) return playSound(['E3', 'C3', 'A2']); const newNames = input.trim().split(',').map(n => n.trim()).filter(n => n); setInput(''); newNames.forEach((name, i) => { setTimeout(async () => { setAnimatingName(name); setTimeout(async () => { await playBeepBoop(); setTimeout(() => { setNames(prev => [...prev, name]); if (i === newNames.length - 1) setAnimatingName(''); }, 50); }, 100); }, i * 200); }); };
  const addStudent = () => { if (!input.trim()) return playSound(['E3', 'C3', 'A2']); const newName = input.trim(); setNames(prev => [...prev, newName]); setStudents(prev => [...prev, { name: newName, score: 0 }]); setInput(''); playSound(); };
  const openScoreDialog = (index: number) => { setSelectedStudentIndex(index); setTempScore(students[index]?.score > 0 ? students[index].score.toString() : ''); setScoreDialogOpen(true); };

  const StudentRow = ({ name, i, isStage2 }: { name: string; i: number; isStage2?: boolean }) => {
    const student = isStage2 ? students[i] : students.find(s => s.name === name);
    return (
      <div key={i} className="flex items-center gap-3 min-w-0">
        <Card className="flex-1 min-w-0"><CardContent className="flex items-center justify-between p-3 min-h-[40px]">
          {editIndex === i ? (<><Input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' ? handleEdit('save') : e.key === 'Escape' ? handleEdit('cancel') : null} className="flex-1 mr-2 text-sm" autoFocus /><div className="flex space-x-1 shrink-0"><Button onClick={() => handleEdit('save')} size="sm">✓</Button><Button onClick={() => handleEdit('cancel')} size="sm" variant="outline">✕</Button></div></>) : (<><span {...(isStage2 ? { onClick: () => openScoreDialog(i), onMouseEnter: () => setHoveredStudent(student?.name || ''), className: `font-bold text-2xl cursor-pointer hover:opacity-75 whitespace-nowrap ${getFontForName(student?.name || '')}` } : { className: `font-bold text-2xl whitespace-nowrap ${getFontForName(name)}` })}>{getEmojiForName(student?.name || name)} {student?.name || name}</span><div className="flex space-x-1 shrink-0 ml-4"><Button onClick={() => {setEditIndex(i); setEditValue(student?.name || name);}} size="sm" variant="outline"><Pencil className="size-3" /></Button><Button onClick={() => isStage2 ? (setStudents(prev => prev.filter((_, idx) => idx !== i)), setNames(prev => prev.filter((_, idx) => idx !== i))) : setNames(prev => prev.filter((_, idx) => idx !== i))} size="sm" variant="outline"><Trash2 className="size-3" /></Button></div></>)}
        </CardContent></Card>
        {student && student.score > 0 ? <Badge className={`min-w-[3rem] h-10 flex items-center justify-center text-lg font-bold shrink-0 text-white ${getBadgeColor(student.score)}`}>{student.score}</Badge> : <div className="min-w-[3rem] h-10 shrink-0"></div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`.fluid-input { width: 600px; height: 160px; overflow: hidden; }`}</style>
      {step === 1 ? (
        <div className="relative min-h-screen p-8">
          <div className="absolute left-8 top-8 w-[700px] max-h-screen overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {names.map((name, i) => <StudentRow key={i} name={name} i={i} />)}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center pt-8 ml-[720px]">
            <div className="text-center flex flex-col items-center">
              <div onClick={() => {if (names.length > 0) {setStudents(names.map(name => ({ name, score: 0 }))); setStep(2);}}} style={{ cursor: names.length === 0 ? 'not-allowed' : 'pointer' }} className="hover:scale-110 transition-transform duration-200">
                <img src="/images/lightening_bolts_2.svg" alt="Lightning bolts" style={{ width: '440px', height: '440px' }} />
              </div>
              <div className="mt-0">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addName()} placeholder="names" disabled={!!animatingName} autoFocus className="fluid-input text-center border-8 rounded-3xl shadow-2xl px-12 resize-none border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" style={{ fontSize: '8rem', lineHeight: '1.2', paddingTop: '2rem', paddingBottom: '2rem' }} />
              </div>
              {animatingName && <div className={`text-6xl font-bold text-black ${getFontForName(animatingName)} animate-pulse mt-8`}>{getEmojiForName(animatingName)} {animatingName}</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen p-8">
          <div className="absolute left-8 top-4 w-[700px] max-h-screen overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {students.map((student, i) => <StudentRow key={i} name={student.name} i={i} isStage2 />)}
            </div>
          </div>
          <div className="absolute left-[54%] top-4 transform -translate-x-1/2"><div className="flex flex-col items-center">
            <svg width="750" height="750" viewBox="0 0 100 190" className="drop-shadow-2xl">
              {Array.from({length: 10}, (_, i) => i + 1).map(level => { const isActive = level <= Math.floor(average); const color = isActive ? getColor(level) : '#374151'; const shouldBlink = allStudentsHave7 && level <= 7 && isActive; return ( <rect key={level} x="15" y={172.5 - (level * 15)} width="70" height="12" fill={color} className={`transition-all duration-500 ${shouldBlink ? 'animate-pulse' : ''}`} style={{ filter: isActive ? `drop-shadow(0 0 12px ${color})` : 'none', animation: shouldBlink ? 'pulse 1s infinite, sparkle 2s infinite' : undefined }} /> ); })}
              <rect x="10" y="15" width="80" height="160" fill="none" stroke="#9ca3af" strokeWidth="3" rx="8" />
              <rect x="35" y="8" width="30" height="12" fill="#9ca3af" rx="4" />
              {allStudentsHave7 && (
                <g className="animate-bounce">
                  {Array.from({length: 20}, (_, i) => (
                    <circle key={i} cx={10 + (i % 5) * 20} cy={10 + Math.floor(i / 5) * 15} r="1" fill="#ffd700" className="animate-ping" style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }} />
                  ))}
                </g>
              )}
            </svg>
          </div></div>
                     <div className="absolute top-6 right-4 w-[600px]"><div className="text-right space-y-6">
            <h2 className={`text-9xl font-bold text-yellow-400 ${getFontForName(hoveredStudent || 'Ben')}`}>"Hello, I'm {getEmojiForName(hoveredStudent || 'Ben')} {hoveredStudent || 'Ben'}</h2>
            <p className="text-5xl text-muted-foreground">and I am so happy to be speaking to you!"</p>
          </div></div>
          <div className="absolute bottom-8 right-4">
            <Card className="border-dashed border-2 w-80"><CardContent className="p-3"><div className="flex items-center space-x-2"><Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStudent()} placeholder="Add student..." className="flex-1 text-sm" /><Button onClick={addStudent} size="sm" variant="outline">+</Button></div></CardContent></Card>
          </div>
        </div>
      )}

      <Dialog.Root open={scoreDialogOpen} onOpenChange={(open) => { if (!open && tempScore) { const score = parseInt(tempScore) || 0; if (score >= 1 && score <= 10) { setStudents(prev => prev.map((s, i) => i === selectedStudentIndex ? { ...s, score } : s)); playSound(); } } setScoreDialogOpen(open); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-gray-300 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl">
            <div className="flex flex-col items-center space-y-6 p-6">
              <div className={`text-4xl font-bold ${getFontForName(students[selectedStudentIndex]?.name || '')}`}>
                {getEmojiForName(students[selectedStudentIndex]?.name || '')} {students[selectedStudentIndex]?.name}
              </div>
              <Input type="number" min="1" max="10" value={tempScore} onChange={(e) => { const value = e.target.value; if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 10)) { setTempScore(value); } else if (value !== '') { playSound(['E2', 'C2', 'A1']); } }} onKeyDown={(e) => { if (e.key === 'Enter') { const score = parseInt(tempScore) || 0; if (score >= 1 && score <= 10) { setStudents(prev => prev.map((s, i) => i === selectedStudentIndex ? { ...s, score } : s)); playSound(); setScoreDialogOpen(false); } else { playSound(['E2', 'C2', 'A1']); } } }} className="text-6xl text-center h-20 w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" autoFocus />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import * as Dialog from '@radix-ui/react-dialog';
import AudioManager from '@/components/AudioManager';
import { StudentRow } from '@/components/StudentRow';
import { ConfettiOverlay } from '@/components/ConfettiOverlay';
import { MAX_STUDENTS, CONFETTI_DURATION, AUDIO_INIT_DELAY } from '@/lib/constants';
import { getFontForName, getEmojiForName, getColor, calculateAverage, allStudentsHaveScore } from '@/lib/energyUtils';

export default function EnergyBatteryApp() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [students, setStudents] = useState<{ name: string; score: number }[]>([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [animatingName, setAnimatingName] = useState('');
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(-1);
  const [tempScore, setTempScore] = useState('');
  const [hoveredStudent, setHoveredStudent] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);

  const audioRef = useRef<any>(null);
  const nameFontsRef = useRef<{ [key: string]: string }>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const getFontForNameMemo = useCallback((name: string) => getFontForName(name, nameFontsRef.current), []);
  const getEmojiForNameMemo = useCallback((name: string) => getEmojiForName(name, nameFontsRef.current, [...names, ...students.map(s => s.name)]), [names, students]);
  const average = useMemo(() => calculateAverage(students), [students]);
  const allStudentsHave7 = useMemo(() => allStudentsHaveScore(students, 7), [students]);
  
  useEffect(() => { const timer = setTimeout(() => { audioRef.current = AudioManager(); }, AUDIO_INIT_DELAY); return () => clearTimeout(timer); }, []);

  const playSound = async (notes?: string[]) => audioRef.current?.playSound(notes);
  const playBeepBoop = async () => audioRef.current?.playBeepBoop();
  const playMarioSuccess = async () => audioRef.current?.playMarioSuccess();
  const playScoreSound = async (score: number) => await playSound(score === 7 ? ['C4', 'E4', 'G4'] : ['G4', 'E4', 'C4']);
  
  const handleEdit = (action: 'save' | 'cancel') => { if (action === 'save' && editValue.trim()) { setNames(prev => prev.map((n, idx) => idx === editIndex ? editValue.trim() : n)); setStudents(prev => prev.map((s, idx) => idx === editIndex ? { ...s, name: editValue.trim() } : s)); } setEditIndex(-1); setEditValue(''); };
  const addName = async () => { if (!input.trim()) return playSound(['E3', 'C3', 'A2']); const newNames = input.trim().split(',').map(n => n.trim()).filter(n => n); setInput(''); newNames.forEach((name, i) => setTimeout(async () => { setAnimatingName(name); setTimeout(async () => { await playBeepBoop(); setTimeout(() => { setNames(prev => [...prev, name]); if (i === newNames.length - 1) { setAnimatingName(''); setTimeout(() => inputRef.current?.focus(), 100); } }, 50); }, 100); }, i * 200)); };
  const addStudent = () => { if (!input.trim()) return playSound(['E3', 'C3', 'A2']); const newName = input.trim(); setNames(prev => [...prev, newName]); setStudents(prev => [...prev, { name: newName, score: 0 }]); setInput(''); playSound(); };
  const setAllStudentsTo7 = () => { setStudents(prev => prev.map(student => ({ ...student, score: 7 }))); playMarioSuccess(); };
  const openScoreDialog = (index: number) => { setSelectedStudentIndex(index); setTempScore(students[index]?.score > 0 ? students[index].score.toString() : ''); setScoreDialogOpen(true); };

  useEffect(() => { if (allStudentsHave7 && students.length > 0) { setShowConfetti(true); playMarioSuccess(); const timer = setTimeout(() => setShowConfetti(false), CONFETTI_DURATION); return () => clearTimeout(timer); } else { setShowConfetti(false); } }, [allStudentsHave7, students.length]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`.fluid-input { width: 600px; height: 160px; overflow: hidden; }`}</style>
      {step === 1 ? (
        <div className="relative min-h-screen p-8">
          <div className="absolute left-8 top-8 w-[700px] max-h-screen overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {names.map((name, i) => (
                <StudentRow key={i} name={name} i={i} editIndex={editIndex} editValue={editValue} setEditIndex={setEditIndex} setEditValue={setEditValue} handleEdit={handleEdit} openScoreDialog={openScoreDialog} setHoveredStudent={setHoveredStudent} setNames={setNames} setStudents={setStudents} getFontForName={getFontForNameMemo} getEmojiForName={getEmojiForNameMemo} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center pt-8 ml-[720px]">
            <div className="text-center flex flex-col items-center">
              <div onClick={() => {if (names.length > 0) {setStudents(names.map(name => ({ name, score: 0 }))); setStep(2);}}} style={{ cursor: names.length === 0 ? 'not-allowed' : 'pointer' }} className="hover:scale-110 transition-transform duration-200">
                <img src="/images/lightening_bolts_2.svg" alt="Lightning bolts" style={{ width: '440px', height: '440px' }} />
              </div>
              <div className="text-xs text-gray-400 mt-2 mb-4">click lightning bolts when done adding names</div>
              <div className="mt-0">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addName()} placeholder="names" disabled={!!animatingName} autoFocus className="fluid-input text-center border-8 rounded-3xl shadow-2xl px-12 resize-none border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" style={{ fontSize: '8rem', lineHeight: '1.2', paddingTop: '2rem', paddingBottom: '2rem' }} />
              </div>
              {animatingName && <div className={`text-6xl font-bold text-black ${getFontForNameMemo(animatingName)} animate-pulse mt-8`}>{getEmojiForNameMemo(animatingName)} {animatingName}</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen p-8">
          <div className="absolute left-8 top-8 w-[700px] max-h-screen overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {students.map((student, i) => (
                <StudentRow key={i} name={student.name} i={i} isStage2={true} student={student} editIndex={editIndex} editValue={editValue} setEditIndex={setEditIndex} setEditValue={setEditValue} handleEdit={handleEdit} openScoreDialog={openScoreDialog} setHoveredStudent={setHoveredStudent} setNames={setNames} setStudents={setStudents} getFontForName={getFontForNameMemo} getEmojiForName={getEmojiForNameMemo} />
              ))}
            </div>
          </div>
          <div className="absolute left-[54%] top-4 transform -translate-x-1/2">
            <div className="flex flex-col items-center">
              <svg width="750" height="750" viewBox="0 0 100 190" className="drop-shadow-2xl">
                {Array.from({length: 10}, (_, i) => i + 1).map(level => { 
                  const isActive = level <= Math.floor(average); 
                  const color = isActive ? getColor(level) : '#374151'; 
                  const shouldBlink = allStudentsHave7 && level <= 7 && isActive; 
                  return <rect key={level} x="15" y={172.5 - (level * 15)} width="70" height="12" fill={color} className={`transition-all duration-500 ${shouldBlink ? 'animate-pulse' : ''}`} style={{ filter: isActive ? `drop-shadow(0 0 12px ${color})` : 'none', animation: shouldBlink ? 'pulse 1s infinite, sparkle 2s infinite' : undefined }} />; 
                })}
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
            </div>
          </div>
          <div className="absolute top-6 right-4 w-[600px]">
            <div className="text-right space-y-6">
              <h2 className={`text-9xl font-bold text-yellow-400 ${getFontForNameMemo(hoveredStudent || 'Ben')}`}>"Hello, I'm {getEmojiForNameMemo(hoveredStudent || 'Ben')} {hoveredStudent || 'Ben'}</h2>
              <p className="text-5xl text-muted-foreground">and I am so happy to be speaking to you!"</p>
              <div className="flex justify-end mt-8">
                <Button onClick={setAllStudentsTo7} variant="ghost" size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-md transition-colors">Set all to 7</Button>
              </div>
            </div>
          </div>
          {students.length < MAX_STUDENTS && (
            <div className="absolute bottom-8 right-4">
              <Card className="border-dashed border-2 w-80">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStudent()} placeholder="Add student..." className="flex-1 text-sm" />
                    <Button onClick={addStudent} size="sm" variant="outline">+</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      <ConfettiOverlay showConfetti={showConfetti} />
      
      <div className="fixed bottom-2 left-2 text-xs text-gray-400">Version 1.2</div>

      <Dialog.Root open={scoreDialogOpen} onOpenChange={(open) => { if (!open && tempScore) { const score = parseInt(tempScore) || 0; if (score >= 1 && score <= 10) { setStudents(prev => prev.map((s, i) => i === selectedStudentIndex ? { ...s, score } : s)); playScoreSound(score); } } setScoreDialogOpen(open); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-gray-300 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl">
            <Dialog.Title className="sr-only">Set Energy Score</Dialog.Title>
            <div className="flex flex-col items-center space-y-6 p-6">
              <div className={`text-4xl font-bold ${getFontForNameMemo(students[selectedStudentIndex]?.name || '')}`}>
                {getEmojiForNameMemo(students[selectedStudentIndex]?.name || '')} {students[selectedStudentIndex]?.name}
              </div>
              <Input type="number" min="1" max="10" value={tempScore} onChange={(e) => { const value = e.target.value; if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 10)) { setTempScore(value); } else if (value !== '') { playSound(['E2', 'C2', 'A1']); } }} onKeyDown={(e) => { if (e.key === 'Enter') { const score = parseInt(tempScore) || 0; if (score >= 1 && score <= 10) { setStudents(prev => prev.map((s, i) => i === selectedStudentIndex ? { ...s, score } : s)); playScoreSound(score); setScoreDialogOpen(false); } else { playSound(['E2', 'C2', 'A1']); } } }} className="text-6xl text-center h-20 w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" autoFocus />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
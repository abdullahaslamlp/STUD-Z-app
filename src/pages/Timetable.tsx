import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import GlassCard from "@/components/GlassCard";
import SEO from "@/components/SEO";
import { Trash2, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useSubjects, useTeachers, useRooms, useSchedules, type ClassSchedule } from "@/hooks/use-timetable";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8am - 9pm

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function Timetable() {
  const subjects = useSubjects();
  const teachers = useTeachers();
  const rooms = useRooms();
  const schedules = useSchedules();

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-16">
      <SEO title="Timetable Manager — Stud-Z" description="Manage your subjects, teachers, rooms and weekly recurring class schedule." path="/timetable" />
      <div className="container mx-auto max-w-6xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="text-primary" /> Timetable Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Plot your week like a boss. Subjects, teachers, rooms — all in one grid 🗓️</p>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="rounded-none border-2 border-border bg-muted">
            <TabsTrigger value="grid">Weekly Grid</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            <WeeklyGrid schedules={schedules.items} subjects={subjects.items} teachers={teachers.items} rooms={rooms.items} />
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <ClassesPanel schedules={schedules} subjects={subjects.items} teachers={teachers.items} rooms={rooms.items} />
          </TabsContent>

          <TabsContent value="subjects" className="mt-6">
            <SubjectsPanel hook={subjects} />
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <TeachersPanel hook={teachers} />
          </TabsContent>

          <TabsContent value="rooms" className="mt-6">
            <RoomsPanel hook={rooms} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function WeeklyGrid({ schedules, subjects, teachers, rooms }: any) {
  const subjectMap = useMemo(() => Object.fromEntries(subjects.map((s: any) => [s.id, s])), [subjects]);
  const teacherMap = useMemo(() => Object.fromEntries(teachers.map((t: any) => [t.id, t])), [teachers]);
  const roomMap = useMemo(() => Object.fromEntries(rooms.map((r: any) => [r.id, r])), [rooms]);

  if (schedules.length === 0) {
    return (
      <GlassCard blocky className="text-center py-12">
        <p className="text-muted-foreground">No classes yet. Head to the <strong>Classes</strong> tab to add your first one 📚</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard blocky className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 border-b-2 border-border">
          <div className="p-2 font-display text-xs text-muted-foreground">Time</div>
          {DAYS.map((d) => (
            <div key={d} className="p-2 font-display font-bold text-center text-foreground">{d}</div>
          ))}
        </div>
        <div className="relative">
          {HOURS.map((h) => (
            <div key={h} className="grid grid-cols-8 border-b border-border/50 h-16">
              <div className="p-2 text-xs text-muted-foreground">{String(h).padStart(2, "0")}:00</div>
              {DAYS.map((_, dayIdx) => (
                <div key={dayIdx} className="border-l border-border/50 relative">
                  {schedules
                    .filter((s: ClassSchedule) => s.day_of_week === dayIdx && toMinutes(s.start_time) >= h * 60 && toMinutes(s.start_time) < (h + 1) * 60)
                    .map((s: ClassSchedule) => {
                      const subj = subjectMap[s.subject_id];
                      const startMin = toMinutes(s.start_time) - h * 60;
                      const duration = toMinutes(s.end_time) - toMinutes(s.start_time);
                      return (
                        <div
                          key={s.id}
                          className="absolute left-1 right-1 rounded-none border-2 border-foreground/20 p-1 text-[10px] overflow-hidden"
                          style={{ top: `${(startMin / 60) * 100}%`, height: `${(duration / 60) * 64}px`, background: subj?.color || "#3b82f6", color: "white" }}
                        >
                          <div className="font-bold truncate">{subj?.name || "Class"}</div>
                          <div className="truncate opacity-90">{s.start_time.slice(0, 5)}-{s.end_time.slice(0, 5)}</div>
                          {roomMap[s.room_id!] && <div className="truncate opacity-80">📍 {roomMap[s.room_id!].name}</div>}
                          {teacherMap[s.teacher_id!] && <div className="truncate opacity-80">👤 {teacherMap[s.teacher_id!].name}</div>}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function ClassesPanel({ schedules, subjects, teachers, rooms }: any) {
  const [form, setForm] = useState({
    subject_id: "", teacher_id: "none", room_id: "none",
    day_of_week: "1", start_time: "09:00", end_time: "10:00",
    recurrence: "weekly", notes: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject_id) return;
    schedules.add.mutate({
      subject_id: form.subject_id,
      teacher_id: form.teacher_id === "none" ? null : form.teacher_id,
      room_id: form.room_id === "none" ? null : form.room_id,
      day_of_week: parseInt(form.day_of_week),
      start_time: form.start_time,
      end_time: form.end_time,
      recurrence: form.recurrence,
      notes: form.notes || null,
    });
    setForm({ ...form, notes: "" });
  };

  if (subjects.length === 0) {
    return <GlassCard blocky><p className="text-muted-foreground text-sm">Add at least one subject first to schedule a class.</p></GlassCard>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <GlassCard blocky>
        <h3 className="font-display font-bold mb-4">Add Class</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Subject</Label>
            <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pick a subject" /></SelectTrigger>
              <SelectContent>{subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Teacher</Label>
              <Select value={form.teacher_id} onValueChange={(v) => setForm({ ...form, teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room</Label>
              <Select value={form.room_id} onValueChange={(v) => setForm({ ...form, room_id: v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {rooms.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Day</Label>
              <Select value={form.day_of_week} onValueChange={(v) => setForm({ ...form, day_of_week: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
            <div><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
          </div>
          <div>
            <Label>Recurrence</Label>
            <Select value={form.recurrence} onValueChange={(v) => setForm({ ...form, recurrence: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={200} /></div>
          <Button type="submit" variant="blocky" className="w-full"><Plus size={16} className="mr-1" /> Add Class</Button>
        </form>
      </GlassCard>

      <GlassCard blocky>
        <h3 className="font-display font-bold mb-4">All Classes ({schedules.items.length})</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {schedules.items.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>}
          {schedules.items.map((s: ClassSchedule) => {
            const subj = subjects.find((x: any) => x.id === s.subject_id);
            return (
              <div key={s.id} className="flex items-center justify-between p-2 border-2 border-border">
                <div>
                  <div className="font-semibold text-sm" style={{ color: subj?.color }}>{subj?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {DAYS[s.day_of_week]} {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)} · {s.recurrence}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => schedules.remove.mutate(s.id)}><Trash2 size={14} /></Button>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

function SubjectsPanel({ hook }: any) {
  const [name, setName] = useState(""); const [code, setCode] = useState(""); const [color, setColor] = useState("#3b82f6");
  return (
    <GlassCard blocky>
      <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; hook.add.mutate({ name: name.trim(), code: code.trim() || null, color }); setName(""); setCode(""); }} className="flex flex-wrap gap-2 items-end mb-4">
        <div className="flex-1 min-w-[150px]"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required /></div>
        <div className="w-32"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} maxLength={20} /></div>
        <div><Label>Color</Label><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 p-1" /></div>
        <Button type="submit" variant="blocky"><Plus size={16} /></Button>
      </form>
      <div className="space-y-2">
        {hook.items.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between p-2 border-2 border-border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ background: s.color }} />
              <span className="font-semibold text-sm">{s.name}</span>
              {s.code && <span className="text-xs text-muted-foreground">({s.code})</span>}
            </div>
            <Button size="icon" variant="ghost" onClick={() => hook.remove.mutate(s.id)}><Trash2 size={14} /></Button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function TeachersPanel({ hook }: any) {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  return (
    <GlassCard blocky>
      <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; hook.add.mutate({ name: name.trim(), email: email.trim() || null }); setName(""); setEmail(""); }} className="flex flex-wrap gap-2 items-end mb-4">
        <div className="flex-1 min-w-[150px]"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required /></div>
        <div className="flex-1 min-w-[150px]"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></div>
        <Button type="submit" variant="blocky"><Plus size={16} /></Button>
      </form>
      <div className="space-y-2">
        {hook.items.map((t: any) => (
          <div key={t.id} className="flex items-center justify-between p-2 border-2 border-border">
            <div><div className="font-semibold text-sm">{t.name}</div>{t.email && <div className="text-xs text-muted-foreground">{t.email}</div>}</div>
            <Button size="icon" variant="ghost" onClick={() => hook.remove.mutate(t.id)}><Trash2 size={14} /></Button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function RoomsPanel({ hook }: any) {
  const [name, setName] = useState(""); const [building, setBuilding] = useState("");
  return (
    <GlassCard blocky>
      <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; hook.add.mutate({ name: name.trim(), building: building.trim() || null }); setName(""); setBuilding(""); }} className="flex flex-wrap gap-2 items-end mb-4">
        <div className="flex-1 min-w-[150px]"><Label>Room</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required /></div>
        <div className="flex-1 min-w-[150px]"><Label>Building</Label><Input value={building} onChange={(e) => setBuilding(e.target.value)} maxLength={50} /></div>
        <Button type="submit" variant="blocky"><Plus size={16} /></Button>
      </form>
      <div className="space-y-2">
        {hook.items.map((r: any) => (
          <div key={r.id} className="flex items-center justify-between p-2 border-2 border-border">
            <div><div className="font-semibold text-sm">{r.name}</div>{r.building && <div className="text-xs text-muted-foreground">{r.building}</div>}</div>
            <Button size="icon" variant="ghost" onClick={() => hook.remove.mutate(r.id)}><Trash2 size={14} /></Button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
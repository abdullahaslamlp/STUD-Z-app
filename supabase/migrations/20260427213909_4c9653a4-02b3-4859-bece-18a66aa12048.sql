-- SUBJECTS
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subjects_select_own" ON public.subjects FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "subjects_insert_own" ON public.subjects FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "subjects_update_own" ON public.subjects FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "subjects_delete_own" ON public.subjects FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- TEACHERS
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers_select_own" ON public.teachers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "teachers_insert_own" ON public.teachers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "teachers_update_own" ON public.teachers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "teachers_delete_own" ON public.teachers FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ROOMS
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  building TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_select_own" ON public.rooms FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "rooms_insert_own" ON public.rooms FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "rooms_update_own" ON public.rooms FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "rooms_delete_own" ON public.rooms FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- CLASS SCHEDULES (recurring)
CREATE TABLE public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  day_of_week SMALLINT NOT NULL, -- 0=Sun..6=Sat
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  recurrence TEXT NOT NULL DEFAULT 'weekly', -- 'weekly' | 'biweekly'
  term_start DATE,
  term_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules_select_own" ON public.class_schedules FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "schedules_insert_own" ON public.class_schedules FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "schedules_update_own" ON public.class_schedules FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "schedules_delete_own" ON public.class_schedules FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER schedules_updated_at BEFORE UPDATE ON public.class_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Validation: end > start, valid day, valid recurrence
CREATE OR REPLACE FUNCTION public.validate_class_schedule()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'end_time must be after start_time';
  END IF;
  IF NEW.day_of_week < 0 OR NEW.day_of_week > 6 THEN
    RAISE EXCEPTION 'day_of_week must be 0-6';
  END IF;
  IF NEW.recurrence NOT IN ('weekly','biweekly') THEN
    RAISE EXCEPTION 'recurrence must be weekly or biweekly';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER schedules_validate BEFORE INSERT OR UPDATE ON public.class_schedules FOR EACH ROW EXECUTE FUNCTION public.validate_class_schedule();

CREATE INDEX idx_schedules_user_day ON public.class_schedules(user_id, day_of_week);
CREATE INDEX idx_subjects_user ON public.subjects(user_id);
CREATE INDEX idx_teachers_user ON public.teachers(user_id);
CREATE INDEX idx_rooms_user ON public.rooms(user_id);
import { supabase } from "../lib/supabase";

// جلب كل الطلاب
export const getStudents = async () => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
};

// إضافة طالب
export const addStudent = async (student) => {
  const { data, error } = await supabase
    .from("students")
    .insert([student])
    .select();

  if (error) throw error;
  return data;
};

// تعديل طالب
export const updateStudent = async (id, updates) => {
  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
};

// حذف طالب
export const deleteStudent = async (id) => {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

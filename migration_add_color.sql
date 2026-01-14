-- Add color column to tasks table with a default blue value
alter table public.tasks 
add column color text default '#3b82f6';

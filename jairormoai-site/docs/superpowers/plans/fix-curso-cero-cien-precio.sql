-- Curso "Claude de Cero a Cien" (slug claude-cero-cien): corrige precio mostrado
-- de $127 a $25 USD, alineado con el link de pago de Guía Claude.
-- Ejecutar en Supabase SQL Editor.

update courses set price_cents = 2500
where slug = 'claude-cero-cien';

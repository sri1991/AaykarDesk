-- AaykarDesk demo seed. Replace firm_id with your actual firm UUID after running migration.
insert into firms (id, name, gstin, email, phone)
values (
  '00000000-0000-0000-0000-000000000001',
  'Demo & Co. Chartered Accountants', '29ABCDE1234F1Z5', 'firm@demo.in', '+91 9999900000'
) on conflict do nothing;

insert into cases (firm_id, case_number, client_name, client_pan, client_email, client_phone, assessment_year, notice_section, notice_type, ao_name, ward_circle, jurisdiction, deadline, status, priority)
values
('00000000-0000-0000-0000-000000000001', 'AD-2026-0001', 'Sundaram Textiles Pvt Ltd', 'AABCS1234F', 'cfo@sundaramtex.in', '+919812345678', '2022-23', '143(2)', 'scrutiny', 'Shri R. Krishnan', 'Circle 3(1)(1)', 'Chennai', current_date + 3, 'awaiting_documents', 'critical'),
('00000000-0000-0000-0000-000000000001', 'AD-2026-0002', 'Meera Iyer', 'AKLPI2345K', 'meera.iyer@example.com', '+919900112233', '2023-24', '142(1)', 'scrutiny', 'Smt P. Lakshmi', 'Ward 12(3)', 'Bengaluru', current_date + 10, 'documents_received', 'high'),
('00000000-0000-0000-0000-000000000001', 'AD-2026-0003', 'Rajesh Kumar Saraf (HUF)', 'AAAHR9821B', 'rajesh.saraf@example.com', '+919811223344', '2021-22', '148A', 'reassessment', 'Shri A. Mehta', 'Range 42', 'Mumbai', current_date + 20, 'triage_complete', 'high'),
('00000000-0000-0000-0000-000000000001', 'AD-2026-0004', 'Greenleaf Organics LLP', 'AAGFG7788L', 'accounts@greenleaf.in', '+919876512345', '2023-24', '143(2)', 'scrutiny', 'Shri V. Naidu', 'Circle 5(2)', 'Hyderabad', current_date - 2, 'draft_ready', 'critical'),
('00000000-0000-0000-0000-000000000001', 'AD-2026-0005', 'Anita Bhargava', 'AHGPB7766C', 'anita.b@example.com', '+919812000000', '2024-25', '139(9)', 'rectification', 'Shri S. Roy', 'Ward 4(1)', 'Kolkata', current_date + 28, 'new', 'medium'),
('00000000-0000-0000-0000-000000000001', 'AD-2026-0006', 'Pranav Sethi', 'BNZPS5544Q', 'pranav@example.com', '+919898765432', '2022-23', '271(1)(c)', 'penalty', 'Shri D. Khurana', 'Range 19', 'Delhi', current_date + 45, 'response_filed', 'low');

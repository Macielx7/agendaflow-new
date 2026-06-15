-- AlterTable
ALTER TABLE "clients" ADD COLUMN "cpf" TEXT;

-- Backfill existing clients with valid unique CPFs
DO $$
DECLARE
  r RECORD;
  base TEXT;
  d1 INT;
  d2 INT;
  sum_val INT;
  i INT;
  cpf_val TEXT;
  counter INT := 0;
BEGIN
  FOR r IN SELECT id FROM clients WHERE cpf IS NULL ORDER BY "createdAt"
  LOOP
    counter := counter + 1;
    base := LPAD((counter + 100000000)::TEXT, 9, '0');

    sum_val := 0;
    FOR i IN 1..9 LOOP
      sum_val := sum_val + CAST(SUBSTRING(base, i, 1) AS INT) * (11 - i);
    END LOOP;
    d1 := 11 - (sum_val % 11);
    IF d1 >= 10 THEN d1 := 0; END IF;

    sum_val := 0;
    FOR i IN 1..9 LOOP
      sum_val := sum_val + CAST(SUBSTRING(base, i, 1) AS INT) * (12 - i);
    END LOOP;
    sum_val := sum_val + d1 * 2;
    d2 := 11 - (sum_val % 11);
    IF d2 >= 10 THEN d2 := 0; END IF;

    cpf_val := base || d1::TEXT || d2::TEXT;
    UPDATE clients SET cpf = cpf_val WHERE id = r.id;
  END LOOP;
END $$;

-- Set NOT NULL
ALTER TABLE "clients" ALTER COLUMN "cpf" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clients_tenantId_cpf_key" ON "clients"("tenantId", "cpf");

-- CreateIndex
CREATE INDEX "clients_cpf_idx" ON "clients"("cpf");

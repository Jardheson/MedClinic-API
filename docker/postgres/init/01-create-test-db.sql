SELECT 'CREATE DATABASE medclinic_test'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'medclinic_test'
)\gexec

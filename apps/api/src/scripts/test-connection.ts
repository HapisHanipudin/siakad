import pg from "pg";

async function testConn(url: string) {
  console.log("Testing:", url);
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query("SELECT 1;");
    console.log("Success! Output:", res.rows);
  } catch (err: any) {
    console.error("Failed:", err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  await testConn("postgresql://siakad:siakad@127.0.0.1:5432/siakad?sslmode=disable");
  await testConn("postgresql://siakad:siakad@localhost:5432/siakad?sslmode=disable");
  await testConn("postgresql://siakad:siakad@192.168.18.20:5432/siakad?sslmode=disable");
  await testConn("postgresql://neondb_owner:npg_pGsSB8Rk0nAb@ep-misty-hat-aobwgahq-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
}

main();

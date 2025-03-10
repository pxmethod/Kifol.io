
import { db } from "./db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating portfolio_media table...");

  try {
    // Create the portfolio_media table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS portfolio_media (
        id SERIAL PRIMARY KEY,
        portfolio_entry_id INTEGER NOT NULL REFERENCES portfolio_entries(id) ON DELETE CASCADE,
        media_url TEXT NOT NULL,
        media_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log("Table created successfully!");
    
    // Migrate existing data
    console.log("Migrating existing media data...");
    
    await db.execute(sql`
      INSERT INTO portfolio_media (portfolio_entry_id, media_url, media_type)
      SELECT id, media_url, media_type
      FROM portfolio_entries
      WHERE media_url IS NOT NULL;
    `);
    
    console.log("Data migration completed!");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

// Execute if this is the main module
if (require.main === module) {
  main()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}


import { db } from "./db";
import { portfolioEntries, portfolioMedia } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "./storage";

async function migrateMediaData() {
  console.log("Starting migration of existing media data...");
  
  try {
    // Get all portfolio entries that have a media_url
    const entries = await db
      .select()
      .from(portfolioEntries)
      .where(eq(portfolioEntries.media_url, null, true)); // Where media_url is not null
    
    console.log(`Found ${entries.length} entries with existing media`);
    
    // For each entry, create a new media record
    for (const entry of entries) {
      if (entry.media_url && entry.media_type) {
        // Create new media record
        await db
          .insert(portfolioMedia)
          .values({
            portfolioEntryId: entry.id,
            mediaUrl: entry.media_url,
            mediaType: entry.media_type,
          });
        
        console.log(`Migrated media for entry ${entry.id}`);
      }
    }
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateMediaData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

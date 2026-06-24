import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

interface ArtistImagesConfig {
  portraitUrl: string | null;
  logoUrl: string | null;
}

const CONFIG_PATH = join(process.cwd(), "src", "lib", "artist-images.json");

async function ensureConfigExists(): Promise<void> {
  try {
    await readFile(CONFIG_PATH, "utf-8");
  } catch {
    const defaultConfig: ArtistImagesConfig = {
      portraitUrl: null,
      logoUrl: null,
    };
    await mkdir(join(process.cwd(), "src", "lib"), { recursive: true });
    await writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
  }
}

export async function getArtistImagesConfig(): Promise<ArtistImagesConfig> {
  try {
    await ensureConfigExists();
    const content = await readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(content) as ArtistImagesConfig;
  } catch (error) {
    console.error("[getArtistImagesConfig] Error:", error);
    return { portraitUrl: null, logoUrl: null };
  }
}

export async function updateArtistImagesConfig(
  updates: Partial<ArtistImagesConfig>,
): Promise<void> {
  try {
    await ensureConfigExists();
    const current = await getArtistImagesConfig();
    const updated = { ...current, ...updates };
    await writeFile(CONFIG_PATH, JSON.stringify(updated, null, 2));
  } catch (error) {
    console.error("[updateArtistImagesConfig] Error:", error);
    throw error;
  }
}

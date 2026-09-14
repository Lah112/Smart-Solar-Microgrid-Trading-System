/**
 * ============================================================================
 * Smart Solar Microgrid Trading System - Seed Password Hash Fixer (dev tool)
 * ----------------------------------------------------------------------------
 * The seed file 04_Database/mongo-seed/init-mongo.js shipped with a placeholder
 * BCrypt string that does NOT match the intended password "Password@123", so
 * every seeded account failed to log in.
 *
 * This one-time utility:
 *   1. Generates a REAL BCrypt hash of "Password@123" (workFactor 11, matching
 *      Helpers/PasswordHasher.cs in the API).
 *   2. Verifies the hash round-trips.
 *   3. Auto-patches the defaultPasswordHash constant in init-mongo.js.
 *
 * After running this, re-seed the database (import-data.bat) and log in.
 *
 * Run:  cd 05_Tools\HashGen   then   dotnet run
 * ============================================================================
 */

using System.Text.RegularExpressions;

const string Password = "Password@123";

// 1. Generate a valid BCrypt hash (workFactor 11 == PasswordHasher.HashPassword)
string hash = BCrypt.Net.BCrypt.HashPassword(Password, workFactor: 11);

Console.WriteLine("============================================================");
Console.WriteLine(" Smart Solar - Seed Password Hash Fixer");
Console.WriteLine("============================================================");
Console.WriteLine($" Password : {Password}");
Console.WriteLine($" BCrypt   : {hash}");

// 2. Sanity check: the generated hash must verify against the password
bool ok = BCrypt.Net.BCrypt.Verify(Password, hash);
Console.WriteLine($" Verify() : {ok}");
Console.WriteLine();

if (!ok)
{
    Console.WriteLine(" [ERROR] Hash failed self-verification. Aborting.");
    return;
}

// 3. Locate init-mongo.js by walking up from the current directory to the repo root
string? seedPath = FindSeedFile(Directory.GetCurrentDirectory());
if (seedPath is null)
{
    Console.WriteLine(" Could not auto-locate 04_Database/mongo-seed/init-mongo.js.");
    Console.WriteLine(" Manually replace the defaultPasswordHash value with the BCrypt string above,");
    Console.WriteLine(" then re-run import-data.bat.");
    return;
}

string content = File.ReadAllText(seedPath);
string patched = Regex.Replace(
    content,
    "(const\\s+defaultPasswordHash\\s*=\\s*\")[^\"]*(\")",
    "$1" + hash + "$2");

if (patched == content)
{
    Console.WriteLine($" Found {seedPath}");
    Console.WriteLine(" ...but the defaultPasswordHash line wasn't matched. Paste the hash above manually.");
    return;
}

File.WriteAllText(seedPath, patched);
Console.WriteLine($" Patched : {seedPath}");
Console.WriteLine(" All seeded accounts now use a valid hash for 'Password@123'.");
Console.WriteLine();
Console.WriteLine(" NEXT STEP -> re-seed the database:");
Console.WriteLine("   cd ..\\..\\04_Database\\mongo-seed");
Console.WriteLine("   .\\import-data.bat");

// Walk up parent directories until we find the seed file.
static string? FindSeedFile(string start)
{
    DirectoryInfo? dir = new DirectoryInfo(start);
    while (dir is not null)
    {
        string candidate = Path.Combine(dir.FullName, "04_Database", "mongo-seed", "init-mongo.js");
        if (File.Exists(candidate)) return candidate;
        dir = dir.Parent;
    }
    return null;
}

using System.Net.Security;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace Turnify.Mobile.Services;

/// <summary>
/// Verifica che il certificato del server corrisponda ai pin SHA-256 attesi.
/// In caso di mancata corrispondenza, la connessione viene rifiutata.
/// Aggiorna <see cref="ExpectedPins"/> dopo ogni rinnovo del certificato.
/// </summary>
public class CertificatePinningHandler : HttpClientHandler
{
    // SHA-256 della chiave pubblica (SPKI) in formato base64.
    // Genera con: openssl s_client -connect samuconfa.it:443 2>/dev/null |
    //             openssl x509 -pubkey -noout | openssl pkey -pubin -outform DER |
    //             openssl dgst -sha256 -binary | base64
    private static readonly HashSet<string> ExpectedPins = new(StringComparer.Ordinal)
    {
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="
    };

    public CertificatePinningHandler()
    {
        ServerCertificateCustomValidationCallback = ValidatePin;
    }

    private static bool ValidatePin(
        HttpRequestMessage _,
        X509Certificate2?  cert,
        X509Chain?         __,
        SslPolicyErrors    policyErrors)
    {
#if DEBUG
        // In debug su emulatore/simulator si accetta qualsiasi certificato
        // per permettere il proxy (Burp/Charles) durante lo sviluppo.
        return true;
#else
        if (policyErrors != SslPolicyErrors.None || cert == null)
            return false;

        try
        {
            var spki = cert.GetPublicKey();
            using var sha256 = SHA256.Create();
            var hash = sha256.ComputeHash(spki);
            var pin  = Convert.ToBase64String(hash);
            return ExpectedPins.Contains(pin);
        }
        catch
        {
            return false;
        }
#endif
    }
}

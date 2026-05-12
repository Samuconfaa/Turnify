using System.Net.Security;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace Turnify.Mobile.Services;

// Per aggiornare i pin dopo rinnovo certificato eseguire:
//   openssl s_client -connect samuconfa.it:443 2>/dev/null \
//     | openssl x509 -pubkey -noout \
//     | openssl pkey -pubin -outform DER \
//     | openssl dgst -sha256 -binary | base64
// Sostituire le costanti CERT_PIN_* di conseguenza.
public class CertificatePinningHandler : HttpClientHandler
{
    private const string CERT_PIN_LEAF   = "REPLACE_WITH_REAL_LEAF_PIN=";
    private const string CERT_PIN_BACKUP = "REPLACE_WITH_REAL_BACKUP_PIN=";

    private static readonly HashSet<string> ExpectedPins = new(StringComparer.Ordinal)
    {
        CERT_PIN_LEAF,
        CERT_PIN_BACKUP
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
        return true;
#else
        if (policyErrors != SslPolicyErrors.None || cert == null)
            return false;

        // Rifiuta i pin placeholder non aggiornati in produzione
        if (CERT_PIN_LEAF.StartsWith("REPLACE_") || CERT_PIN_BACKUP.StartsWith("REPLACE_"))
            return false;

        try
        {
            var spki = cert.GetPublicKey();
            using var sha256 = SHA256.Create();
            var pin = Convert.ToBase64String(sha256.ComputeHash(spki));
            return ExpectedPins.Contains(pin);
        }
        catch
        {
            return false;
        }
#endif
    }
}

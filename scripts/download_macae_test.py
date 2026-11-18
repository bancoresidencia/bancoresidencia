import requests

urls = [
    "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFgmTOQ3m0okVeymn8uPav4Kryxe_r8tgnY-9-gGoMRV6JG3mxt9mUjU4mNGlmK3y5BvXl0rM53nxd4BG2hVh5mMi6sRvS0S2q4TxMWzFYlrWtE2HV8BQoEVhXbh39MPB0I4PXpCYEI",
    "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFCNE0yheVAWNaY2Ky_W14YFJUZMlcWv42A5nFXRoInKM-wnOD84JZpPnUZEbSQEc1srb3yRfrwlZyMb_PellFKGbAytJQVO4RTo_IeXo86QOPCQZLsUOTJatoCv2H8ILO-N2e8aJdZ"
]

for i, u in enumerate(urls):
    try:
        r = requests.get(u, allow_redirects=True, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
        print(f"URL {i+1} final URL: {r.url}")
        print(f"Status: {r.status_code}, Length: {len(r.content)} bytes, Content-Type: {r.headers.get('Content-Type')}")
        if r.status_code == 200 and 'pdf' in r.headers.get('Content-Type', '').lower():
            fname = f"data/incoming_exams/macae_gb_{i+1}.pdf"
            with open(fname, "wb") as f:
                f.write(r.content)
            print(f"Saved to {fname}")
    except Exception as e:
        print(f"Error {i+1}: {e}")

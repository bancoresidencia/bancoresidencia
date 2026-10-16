import urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

sources = [
    (2026, 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHUkzGBOydLuXkOQOUxu4JB8CcmgoMstH0rmeF9hVbKYXps8UDe1qwLbcMfqaVtO1gjmq-y93qJInkZtD_LifLxMJqigO188Qc4IpYxOUcbYNqcTCcBbOE484l0UXsMBQNZvJ7z3Eb3zuIdLID2WDrWp5_Pg6tiYRAIeq-cxY4hA_KyzbHuZMvSPS0i9kb3J6KaS7hZ0ODF-VfSl_4iodXuXuIlc-aiPPrwnx6BDB9cgf3JDKPor4bQ9QVJaTaDRYdBSn6O2cGMcE4='),
    (2024, 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEPH3w423TSOdumBPmGAbx2IE5Mil_7b5A--feuBg1I-eyxb7uAQxYFix5ci4C3U9GbXDcf-o2icgTl7ISEo5GzmGWgR33-qcMDJnbBtZlmUeIkKr3pR24TK7ymtuKqn7S6ASQobjFME7tJdI3DUgQrq7qgpkYtl0aSJyKBfpS6A6-MFprLuQwrUzRyyk-MnRo-XPlSjkEL8cVR1b9XJyZ2FtzuOXvYj93yjCy_ahtpryVHolK_tUo='),
    (2023, 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHwoOZGx8fJiQukVNJzmCFuq8f0LeDWNeZSaZk343WlGvtacEvGXLrhPRoS3bufib4zcgjpy5ua_Rk6LPjvLlUeBFSrxip1bHJK5dFvumbO927LtqyN_HndZs_AEJEwGzKHBvuVswd0245d9V1zxLjA1wxuEgmbO2TGwdoKejYPOLFO_JMmIO8thz2AaYeHTifBNZz5LyvT5VMjKvvzAw4BDR-J_fZA9n60u1sXU1hWRlmugXeHIvR7z0w7'),
    (2020, 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF45gtMT6P4bKqEAWyC_Zr05OViUxAEVOtpmPOOAsgt3VgOt1NmQliTnFAhUTr9Eha2Esq6Y4OBwZoN0ib_oPBN4B3zqHE-N1kVDh7yvsjtZhhiALhecOavmdVizcoWjm_tpemMRCRJfU_2f2g4rZ7pFpbXh0ESoXUdzxWMd_nacDiCql-oqiQ2hLDFBP0AkzwX5OHwYsjM2ldMzyfTnli2lDN0ROotndmJRCycxrlLIrbx')
]

for year, url in sources:
    try:
        res = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx, timeout=8)
        print(f"[{year}] -> {res.geturl()}")
    except Exception as e:
        print(f"[{year}] Error: {e}")

# Clopos Catalog Data Extraction Audit

Generated on: 7/31/2026, 11:42:08 AM

## Extraction Metadata
- **Discovery Endpoint**: `https://oilganicshop.clopos.com/api-rc/emenu/products?x_venue=1`
- **Method**: API endpoint discovery (XHR/Fetch monitoring)
- **Currency**: AZN
- **Status**: **VALIDATED SUCCESSFUL**

## Summary Statistics

| Metric | Count |
|---|---:|
| Categories | 19 |
| Raw source product entities | 244 |
| Final grouped products | 175 |
| Total variants | 244 |
| Multi-variant products | 69 |
| Unique CDN images | 242 |
| Missing from current website | 27 |
| Unmatched site products (not in Clopos) | 29 |
| Mismatched items (variant/price differences) | 65 |

## Manual Spot Checks Verification

### 1. Simple single-variant product
- **Name**: `Acı badam yağı` (id: prod-aci-badam-yagi)
- **Variants**: 100ml (Price: 10 AZN)

### 2. Product with 100 ml and 250 ml variants
- **Name**: `Qarazirə yağı Suriya toxumundan` (id: prod-qarazire-yagi-suriya-toxumundan)
- **Variants**:
  - 100ml (Price: 10 AZN) [id: size-qarazire-yagi-suriya-toxumundan-100ml]
  - 250ml (Price: 23 AZN) [id: size-qarazire-yagi-suriya-toxumundan-250ml]

### 3. Product with 200 gr and 500 gr variants
- **Name**: `Badam əzməsi` (id: prod-badam-ezmesi)
- **Variants**:
  - 200gr (Price: 8 AZN)
  - 500gr (Price: 16 AZN)

### 4. Product with 1 litre and 2 litre variants
- **Name**: `Günəbaxan yağı` (id: prod-gunebaxan-yagi)
- **Variants**:
  - 1litr (Price: 8 AZN)
  - 2litr (Price: 15 AZN)

### 5. Similarly named but separate products (preserved correctly)
- **Name**: `Günəbaxan yağı` (id: prod-gunebaxan-yagi) vs `Günəbaxan yağı süzülmüş` (id: prod-gunebaxan-yagi-suzulmus) vs `Günəbaxan yağı Soyuq sıxım` (id: prod-gunebaxan-yagi-soyuq-sixim). They represent distinct Clopos IDs and suffixes, and are correctly kept separate.

## Validation Errors Log
No validation errors. Perfect integrity!

## Unmatched Website Products (Exist on Site but not in Clopos)
- Balqabaq şirəsi
- Balqabaq tumu
- Çiçək balı
- Darçın Şri-lanka
- Feyxoa şirəsi
- Günəbaxan yağı 1litr
- Günəbaxan yağı 2litr
- Günəbaxan yağı süzülmüş 1 litr
- Günəbaxan yağı süzülmüş 2litr
- Heyva şirəsi
- Himalay duzu
- İtburnu
- Qara qarağat şirəsi
- Qarazirə(Çörəkotu)toxumu Suriya
- Qarışıq əzmə 0.2kg
- Qırmızı qarağat şirəsi
- Pomidor şirəsi
- Psilium toxumu
- Sarıkök tozu
- Şam qozası bəhməzi
- Tat zeytun yağı 5litr
- Udhindi tablet 220 əd
- Yemişan
- Zeytun yağı rafinə 1litr
- Zeytun yağı rafinə 2litr
- Zeytun yağı soyuq sıxım 1litr
- Zeytun yağı soyuq sıxım 2 litr
- Zəfəran limonadı
- Zəncəfil quru

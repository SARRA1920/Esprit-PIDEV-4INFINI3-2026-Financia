"""
Micro-service Python - Reconnaissance faciale avec FaceNet (PyTorch)
Aucune compilation C++ requise, fonctionne sur Windows directement.

Installation :
    pip install facenet-pytorch torch torchvision flask Pillow

Lancer avec :
    python deepface_service.py
Port : 5000
"""

import base64
import io
import torch
import torch.nn.functional as F
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from flask import Flask, request, jsonify

app = Flask(__name__)

print("Chargement des modèles FaceNet...")
mtcnn  = MTCNN(image_size=160, margin=20, keep_all=False, post_process=True)
resnet = InceptionResnetV1(pretrained="vggface2").eval()
print("Modèles prêts.")

# Similarité cosinus minimale pour valider l'identité
# 0.7 = souple | 0.8 = équilibré | 0.9 = strict
THRESHOLD = 0.75


def base64_to_embedding(b64_string: str):
    """Décode une image base64 et retourne son vecteur de visage (512-d)."""
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]

    img_bytes = base64.b64decode(b64_string)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    face_tensor = mtcnn(img)
    if face_tensor is None:
        raise ValueError("Aucun visage détecté sur l'image")

    with torch.no_grad():
        embedding = resnet(face_tensor.unsqueeze(0))
    return embedding


@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok", "service": "facenet-pytorch"}


@app.route("/compare", methods=["POST"])
def compare():
    """
    Compare deux images de visage.
    Corps JSON :
    {
        "referenceImage": "<base64>",
        "probeImage":     "<base64>"
    }
    Réponse :
    {
        "match":      true / false,
        "similarity": 87.5,     // pourcentage (cosinus)
        "distance":   0.13,
        "model":      "facenet-vggface2"
    }
    """
    data = request.get_json(force=True)

    ref_b64   = data.get("referenceImage")
    probe_b64 = data.get("probeImage")

    if not ref_b64 or not probe_b64:
        return {"error": "referenceImage et probeImage sont requis"}, 400

    try:
        emb_ref   = base64_to_embedding(ref_b64)
        emb_probe = base64_to_embedding(probe_b64)
    except ValueError as e:
        return {
            "match": False, "similarity": 0.0, "distance": 1.0,
            "error": str(e)
        }, 422

    similarity = float(F.cosine_similarity(emb_ref, emb_probe).item())
    distance   = round(1.0 - similarity, 4)
    match      = similarity >= THRESHOLD

    return {
        "match":      match,
        "similarity": round(similarity * 100, 2),
        "distance":   distance,
        "model":      "facenet-vggface2"
    }


if __name__ == "__main__":
    print("=== FaceNet Service démarré sur http://localhost:5000 ===")
    app.run(host="0.0.0.0", port=5000, debug=False)

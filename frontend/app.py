"""
app.py  –  CropSense AI  (Simple 2-page version)
=================================================
Page 1 : Home  – fetch location (small), go to Upload
Page 2 : Upload & Detect – upload image, select crop, run model, show result

Run:
    cd frontend
    streamlit run app.py
"""

import os, sys
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import streamlit as st
from PIL import Image
import io

from backend.model_loader  import get_available_crops, load_model_and_labels
from backend.predictor     import preprocess_image, run_inference, format_class_name
from backend.weather       import fetch_weather

# ── page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="CropSense AI",
    page_icon="🌿",
    layout="centered",
)

# ── global CSS  (white background, Inter font, minimal styling) ───────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif !important;
    background-color: #ffffff !important;
    color: #1a1a1a !important;
}
.stApp { background-color: #ffffff !important; }

/* hide default streamlit chrome */
#MainMenu, footer, header { visibility: hidden; }

/* ── card ─────────────────────────────────────────────────────────── */
.card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px 28px;
    margin-bottom: 16px;
}

/* ── primary button ───────────────────────────────────────────────── */
.stButton > button {
    background: #16a34a !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    font-size: 0.92rem !important;
    padding: 10px 24px !important;
    width: 100% !important;
    transition: background 0.2s ease !important;
}
.stButton > button:hover {
    background: #15803d !important;
}

/* ── file uploader ────────────────────────────────────────────────── */
.stFileUploader > div {
    border: 2px dashed #d1d5db !important;
    border-radius: 10px !important;
    background: #f9fafb !important;
}

/* ── select box ───────────────────────────────────────────────────── */
.stSelectbox > div > div {
    background: #ffffff !important;
    border: 1px solid #d1d5db !important;
    border-radius: 8px !important;
    color: #1a1a1a !important;
}

/* ── result ───────────────────────────────────────────────────────── */
.result-name {
    font-size: 1.6rem;
    font-weight: 700;
    color: #15803d;
    margin: 0 0 4px 0;
}
.result-conf {
    font-size: 0.95rem;
    color: #6b7280;
    margin-bottom: 14px;
}
.conf-track {
    height: 8px;
    background: #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
}
.conf-fill {
    height: 100%;
    background: #16a34a;
    border-radius: 6px;
}
.top3-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.87rem;
}
.top3-name { flex: 1; color: #374151; }
.top3-pct  { color: #6b7280; font-weight: 600; width: 40px; text-align: right; }

/* ── weather pill ─────────────────────────────────────────────────── */
.weather-pill {
    display: inline-flex;
    align-items: center;
    gap: 18px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 0.85rem;
    color: #166534;
    margin-bottom: 8px;
}
.weather-metric { text-align: center; }
.weather-metric .val { font-size: 1.05rem; font-weight: 700; }
.weather-metric .lbl { font-size: 0.72rem; color: #16a34a; margin-top: 1px; }
</style>
""", unsafe_allow_html=True)

# ── session state defaults ─────────────────────────────────────────────────────
if "page"       not in st.session_state: st.session_state["page"]       = "home"
if "weather"    not in st.session_state: st.session_state["weather"]    = None
if "prediction" not in st.session_state: st.session_state["prediction"] = None
if "disp_img"   not in st.session_state: st.session_state["disp_img"]   = None


# ═══════════════════════════════════════════════════════════════════════════════
#  PAGE 1 — HOME
# ═══════════════════════════════════════════════════════════════════════════════

def page_home():
    st.markdown("<br>", unsafe_allow_html=True)

    # ── Title ─────────────────────────────────────────────────────────────────
    st.markdown("""
    <div style="text-align:center; margin-bottom: 36px;">
        <div style="display:inline-block; background:#f0fdf4; border:1px solid #bbf7d0;
                    border-radius:50px; padding:6px 18px; font-size:0.8rem;
                    color:#16a34a; font-weight:600; margin-bottom:16px;">
            AI-Powered Plant Disease Detection
        </div>
        <h1 style="font-size:2.4rem; font-weight:700; color:#111827; margin:0 0 10px 0;
                   letter-spacing:-0.5px; line-height:1.2;">
            CropSense AI
        </h1>
        <p style="font-size:1rem; color:#6b7280; max-width:420px; margin:0 auto; line-height:1.7;">
            Upload a leaf image and get an instant disease diagnosis
            powered by deep learning models trained on thousands of crop images.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # ── Location (small, subtle) ───────────────────────────────────────────────
    col_loc, _ = st.columns([1, 2])
    with col_loc:
        if st.button("Fetch My Location Weather", key="btn_fetch_home"):
            st.session_state["weather"] = fetch_weather()

    if st.session_state["weather"]:
        w = st.session_state["weather"]
        st.markdown(f"""
        <div class="weather-pill">
            <div class="weather-metric">
                <div class="val">{w['city']}, {w['state']}</div>
                <div class="lbl">Location</div>
            </div>
            <div style="width:1px;height:34px;background:#bbf7d0;"></div>
            <div class="weather-metric">
                <div class="val">{w['temperature']:.0f}°C</div>
                <div class="lbl">Temp</div>
            </div>
            <div class="weather-metric">
                <div class="val">{w['humidity']}%</div>
                <div class="lbl">Humidity</div>
            </div>
            <div class="weather-metric">
                <div class="val">{w['rainfall']:.0f} mm</div>
                <div class="lbl">Rainfall</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        st.caption(f"Condition: {w['condition']}  •  Click again to change location")

    st.markdown("<br><br>", unsafe_allow_html=True)

    # ── CTA button ────────────────────────────────────────────────────────────
    _, cta_col, _ = st.columns([1, 2, 1])
    with cta_col:
        if st.button("Upload & Detect Disease", key="btn_go_upload"):
            st.session_state["page"] = "detect"
            st.rerun()


# ═══════════════════════════════════════════════════════════════════════════════
#  PAGE 2 — UPLOAD & DETECT
# ═══════════════════════════════════════════════════════════════════════════════

def page_detect():
    # ── Back link ─────────────────────────────────────────────────────────────
    if st.button("Back to Home", key="btn_back"):
        st.session_state["page"]       = "home"
        st.session_state["prediction"] = None
        st.session_state["disp_img"]   = None
        st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("""
    <h2 style="font-size:1.7rem;font-weight:700;color:#111827;margin:0 0 6px 0;">
        Upload Leaf Image
    </h2>
    <p style="font-size:0.92rem;color:#6b7280;margin:0 0 24px 0;">
        Please upload a clear, close-up photo of the leaf to diagnose.
        Supported formats: JPG, JPEG, PNG, WEBP.
    </p>
    """, unsafe_allow_html=True)

    # ── Inputs ────────────────────────────────────────────────────────────────
    CROPS = get_available_crops()
    available = [c for c in CROPS if not CROPS[c].get("unavailable")]

    left_col, right_col = st.columns([1, 1], gap="large")

    with left_col:
        uploaded = st.file_uploader(
            "Drop your leaf image here or click to browse",
            type=["jpg", "jpeg", "png", "bmp", "webp"],
            key="uploader_detect",
        )

        selected_crop = st.selectbox(
            "Select Crop",
            options=available,
            key="crop_select",
        )

        run_btn = st.button(
            "Detect Disease",
            key="btn_detect",
            disabled=(uploaded is None),
        )

        if uploaded is None:
            st.markdown("""
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;
                        padding:10px 14px;font-size:0.82rem;color:#9ca3af;margin-top:8px;">
                No image uploaded yet. Please choose a leaf image above.
            </div>
            """, unsafe_allow_html=True)

    with right_col:
        if uploaded:
            display_arr, model_input = preprocess_image(uploaded)
            st.session_state["disp_img"]    = display_arr
            st.session_state["model_input"] = model_input
            st.image(display_arr, caption="Preview", use_container_width=True)

    # ── Run detection ─────────────────────────────────────────────────────────
    if run_btn and uploaded:
        cfg = CROPS[selected_crop]

        with st.spinner(f"Loading {selected_crop} model…"):
            model, label_dict = load_model_and_labels(cfg["model_file"], cfg["labels_file"])

        if model is None:
            st.error("Could not load model. Please check the models directory.")
        else:
            with st.spinner("Analysing image…"):
                pred = run_inference(st.session_state["model_input"], model, label_dict)
                st.session_state["prediction"] = pred
                st.session_state["pred_crop"]  = selected_crop

    # ── Show results ──────────────────────────────────────────────────────────
    if st.session_state.get("prediction"):
        pred   = st.session_state["prediction"]
        name   = format_class_name(pred["predicted_class"])
        conf   = pred["confidence"]
        top3   = pred["top3"]
        conf_pct = int(conf * 100)

        st.markdown("<hr style='margin:28px 0;border-color:#e5e7eb;'>", unsafe_allow_html=True)
        st.markdown("""
        <p style="font-size:0.8rem;font-weight:600;color:#9ca3af;
                  letter-spacing:1.2px;text-transform:uppercase;margin-bottom:16px;">
            Diagnosis Result
        </p>
        """, unsafe_allow_html=True)

        res_left, res_right = st.columns([1, 1], gap="large")

        with res_left:
            # Healthy vs disease color
            is_healthy = "healthy" in pred["predicted_class"].lower() or "normal" in pred["predicted_class"].lower()
            name_color = "#16a34a" if is_healthy else "#dc2626"

            st.markdown(f"""
            <div class="card">
                <div style="font-size:0.75rem;color:#9ca3af;font-weight:600;
                            letter-spacing:1px;margin-bottom:10px;">DETECTED CONDITION</div>
                <div class="result-name" style="color:{name_color};">{name}</div>
                <div class="result-conf">Confidence: <strong>{conf_pct}%</strong></div>
                <div class="conf-track">
                    <div class="conf-fill" style="width:{conf_pct}%;background:{'#16a34a' if is_healthy else '#dc2626'};"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)


            # Crop & model info
            crop_name = st.session_state.get("pred_crop", "—")
            st.markdown(f"""
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;
                        padding:10px 14px;font-size:0.8rem;color:#6b7280;margin-top:10px;">
                Crop: <strong style="color:#374151;">{crop_name}</strong> &nbsp;|&nbsp;
                Model: <strong style="color:#374151;">EfficientNetB0</strong>
            </div>
            """, unsafe_allow_html=True)

        with res_right:
            if st.session_state.get("disp_img") is not None:
                st.image(
                    st.session_state["disp_img"],
                    caption="Analysed leaf",
                    use_container_width=True,
                )



        # ── Detect again ──────────────────────────────────────────────────────
        st.markdown("<br>", unsafe_allow_html=True)
        _, reset_col, _ = st.columns([2, 1, 2])
        with reset_col:
            if st.button("Detect Another Image", key="btn_reset"):
                st.session_state["prediction"] = None
                st.session_state["disp_img"]   = None
                st.rerun()


# ═══════════════════════════════════════════════════════════════════════════════
#  ROUTER
# ═══════════════════════════════════════════════════════════════════════════════

if st.session_state["page"] == "home":
    page_home()
else:
    page_detect()

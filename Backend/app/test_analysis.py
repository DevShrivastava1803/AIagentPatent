import sys
import os

# Add Backend to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.analysis_service import analyze_patent

if __name__ == "__main__":
    result = analyze_patent()
    if result:
        print("\n--- Patent Analysis Result ---")
        for key, value in result.items():
            print(f"\n🔹 {key.upper()}:\n{value}")
    else:
        print("⚠️ No data found in ChromaDB or analysis failed.")

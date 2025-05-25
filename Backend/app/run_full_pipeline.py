from app.services.process import process_pdf_to_chroma
from app.services.analysis_service import analyze_patent
from app.services.vector_db.chroma_connector import ChromaConnector
from app.services.get_embedding_function import get_embedding_function


def main():
    pdf_path = r"C:\Users\ishak\OneDrive\Desktop\MINOR 2B\AIagentPatent\Backend\uploads\Document1.pdf"

    print("Step 1: Processing and ingesting PDF into ChromaDB...")
    process_pdf_to_chroma(pdf_path)
    print("Ingestion complete.")

    print("\nStep 2: Verifying data in ChromaDB...")
    chroma = ChromaConnector()
    try:
        documents = chroma.get_all_documents()  # Adjust if needed
        print(f"Documents stored in ChromaDB: {len(documents)}")
    except Exception as e:
        print(f"Error accessing ChromaDB documents: {e}")
        return

    if len(documents) == 0:
        print("⚠️ No data found in ChromaDB after ingestion. Please check ingestion logic.")
        return

    print("\nStep 3: Running analysis on ingested data...")
    try:
        analysis_result = analyze_patent()
        if analysis_result:
            print("Analysis result:")
            print(analysis_result)
        else:
            print("⚠️ Analysis returned no result or failed.")
    except Exception as e:
        print(f"Error during analysis: {e}")

if __name__ == "__main__":
    main()

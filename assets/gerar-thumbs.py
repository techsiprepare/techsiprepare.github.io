import os
from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image

# ================= CONFIGURAÇÕES INDISPENSÁVEIS PARA WINDOWS =================
# Altere o caminho abaixo para a pasta 'bin' do Poppler que você baixou e extraiu:
CAMINHO_POPPLER = r"C:\poppler\library\bin" 

PASTA_PROVAS = Path("./provas")
PASTA_THUMBS = Path("./thumbs")
LARGURA_CARD = 400  # Largura ideal para cards de sites
# ==============================================================================

def extrair_capas():
    if not PASTA_PROVAS.exists():
        print(f"Erro: A pasta '{PASTA_PROVAS.resolve()}' nao foi encontrada.")
        return

    arquivos_pdf = list(PASTA_PROVAS.glob("*.pdf")) + list(PASTA_PROVAS.glob("*.PDF"))
    
    if not arquivos_pdf:
        print("Nenhum arquivo PDF encontrado na pasta.")
        return

    print(f"Encontrados {len(arquivos_pdf)} arquivos PDF. Iniciando extracao...\n")

    for caminho_pdf in arquivos_pdf:
        nome_base = caminho_pdf.stem
        caminho_saida = PASTA_THUMBS / f"{nome_base}.webp"

        try:
            # Passamos o poppler_path explicitamente para funcionar no Windows
            paginas = convert_from_path(
                caminho_pdf, 
                first_page=1, 
                last_page=1, 
                dpi=150, 
                poppler_path=CAMINHO_POPPLER
            )
            
            if paginas:
                capa = paginas[0]
                
                # Redimensionamento proporcional
                proporcao = LARGURA_CARD / float(capa.size[0])
                altura_card = int((float(capa.size[1]) * float(proporcao)))
                capa_redimensionada = capa.resize((LARGURA_CARD, altura_card), Image.Resampling.LANCZOS)
                
                # Salva em WebP otimizado para web
                capa_redimensionada.save(caminho_saida, "WEBP", quality=80)
                print(f" -> Sucesso: {caminho_pdf.name} convertido para {caminho_saida.name}")
            else:
                print(f" -> Falha: Nao foi possivel ler as paginas de {caminho_pdf.name}")
                
        except Exception as e:
            print(f" -> Erro ao processar {caminho_pdf.name}: {e}")

if __name__ == "__main__":
    extrair_capas()
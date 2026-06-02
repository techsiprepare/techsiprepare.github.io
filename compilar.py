import os

# Nome do arquivo de saída
ARQUIVO_SAIDA = "projeto_completo.txt"

# Extensões de arquivos que você quer compilar
EXTENSOES_PERMITIDAS = {'.js', '.html', '.css', '.json', '.md'}

# Pastas que você quer ignorar (caso existam no projeto)
PASTAS_IGNORADAS = {'node_modules', '.git', '.vscode', 'dist', 'build'}

def compilar_projeto():
    print("Iniciando a compilação dos arquivos...")
    
    with open(ARQUIVO_SAIDA, "w", encoding="utf-8") as arquivo_final:
        # Percorre todas as pastas e arquivos a partir do diretório atual
        for raiz, diretorios, arquivos in os.walk("."):
            
            # Modifica a lista de diretórios in-place para ignorar pastas indesejadas
            diretorios[:] = [d for d in diretorios if d not in PASTAS_IGNORADAS]
            
            for nome_arquivo in arquivos:
                # Evita que o próprio script ou o arquivo de saída sejam lidos
                if nome_arquivo in [ARQUIVO_SAIDA, "compilar.py"]:
                    continue
                    
                caminho_completo = os.path.join(raiz, nome_arquivo)
                _, extensao = os.path.splitext(nome_arquivo)
                
                # Verifica se o arquivo tem uma das extensões permitidas
                if extensao.lower() in EXTENSOES_PERMITIDAS:
                    try:
                        print(f"Adicionando: {caminho_completo}")
                        
                        # Escreve o cabeçalho identificando o arquivo
                        arquivo_final.write("\n" + "="*80 + "\n")
                        arquivo_final.write(f" ARQUIVO: {caminho_completo}\n")
                        arquivo_final.write("="*80 + "\n\n")
                        
                        # Lê o conteúdo do arquivo e escreve no arquivo final
                        with open(caminho_completo, "r", encoding="utf-8") as f:
                            arquivo_final.write(f.read())
                            
                        arquivo_final.write("\n") # Linha em branco ao final do conteúdo
                        
                    except Exception as e:
                        print(f"Erro ao ler {caminho_completo}: {e}")

    print(f"\nPronto! Tudo foi compilado com sucesso em '{ARQUIVO_SAIDA}'.")

if __name__ == "__main__":
    compilar_projeto()
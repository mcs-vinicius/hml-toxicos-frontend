# React + Vite

Deploy da aplicação:

Backend:
- Para realizar o Deploy, sera necessario alterar o link contido no "prod_origin" para  o link do deploy do frontend. 
- Usar o codigo: "with app.app_context(): db.create_all()" apenas no deploy inicial para que seja criado o banco de dados, após a criação do banco o mesmo deverá ser removido ou comentado.
    Variaveis de ambiente e Ajustes: 
    - DATABASE_URL: inserir o valor contido no campo "Internal Database URL" do Banco de dados;
    - FRONTEND_URL: Link do Frontend;
    - SECRET_KEY: Gerar Altomaticamente.
    - Build Command: Alterar para "pip install -r requirements.txt && python app.py init-db" (Ele irar instalar as dependencias do requirements.txt e criar o banco de dados).

Frontend:
 - Altera o link do Backend contido no arquivo ".env";
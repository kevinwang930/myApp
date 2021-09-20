with e.connect() as conn:
        result = conn.execute(text(f'SELECT name FROM sqlite_master WHERE type="table";'))
        print(result.all())
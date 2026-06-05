from config.database_manager import Database

db = Database() 

if __name__ == "__main__":
    import argparse 
    
    parser = argparse.ArgumentParser(description="Database management CLI")
    subparser = parser.add_subparsers(dest="command")

    # setup and clean command
    subparser.add_parser("setup")
    subparser.add_parser("clean")

    args = parser.parse_args() 

    if args.command is None:
        parser.print_help()
        raise SystemExit(1)

    db.setup_database(args.command)

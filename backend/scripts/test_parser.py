"""Script CLI para probar el parser sin levantar la API."""

import json
import sys
from pathlib import Path

from app.excel_parser import parse_excel


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "03.07.2026.xlsx"
    rutas = parse_excel(path)
    print(f"Fecha: {rutas[0].fecha if rutas else 'N/A'}")
    print(f"Rutas: {len(rutas)}")
    print(f"Pedidos: {sum(len(r.pedidos) for r in rutas)}")
    for r in rutas:
        print(f"\n--- {r.nombre_zona} ({r.lado}) ---")
        print(f"  Conductor: {r.conductor} | Placa: {r.placa} | Aux: {r.auxiliar}")
        print(f"  Pedidos: {len(r.pedidos)}")
    if "--json" in sys.argv:
        data = [
            {
                "nombre_zona": r.nombre_zona,
                "lado": r.lado,
                "conductor": r.conductor,
                "placa": r.placa,
                "pedidos": [p.__dict__ for p in r.pedidos],
            }
            for r in rutas
        ]
        print(json.dumps(data, indent=2, default=str))


if __name__ == "__main__":
    main()

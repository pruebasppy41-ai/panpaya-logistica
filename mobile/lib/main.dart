import 'package:flutter/material.dart';

void main() => runApp(const PanPaYaApp());

class PanPaYaApp extends StatelessWidget {
  const PanPaYaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pan Pa Ya Logística',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      ),
      debugShowCheckedModeBanner: false,
      home: const SeleccionPlacaScreen(),
    );
  }
}

// PANTALLA 1: SELECCIÓN DINÁMICA DE VEHÍCULO
class SeleccionPlacaScreen extends StatefulWidget {
  const SeleccionPlacaScreen({super.key});

  @override
  State<SeleccionPlacaScreen> createState() => _SeleccionPlacaScreenState();
}

class _SeleccionPlacaScreenState extends State<SeleccionPlacaScreen> {
  String? _placaSeleccionada;

  // Simulación de placas cargadas dinámicamente desde el Excel de hoy
  final List<String> _placasHoy = ['JUZ117', 'SKZ933', 'SPN093', 'NOK120'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('🍞',
                  style: TextStyle(fontSize: 50), textAlign: TextAlign.center),
              const SizedBox(height: 10),
              const Text(
                'PAN PA YA',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                  letterSpacing: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const Text(
                'Control de Entregas Diario',
                style: TextStyle(fontSize: 14, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              const Text(
                'Selecciona la placa del vehículo para iniciar ruta:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF334155),
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _placaSeleccionada,
                    hint: const Text('Seleccionar Placa...',
                        style: TextStyle(fontSize: 14)),
                    isExpanded: true,
                    items: _placasHoy.map((String placa) {
                      return DropdownMenuItem<String>(
                        value: placa,
                        child: Text(placa,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace')),
                      );
                    }).toList(),
                    onChanged: (val) => setState(() => _placaSeleccionada = val),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                onPressed: _placaSeleccionada == null
                    ? null
                    : () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                HojaRutaScreen(placa: _placaSeleccionada!),
                          ),
                        );
                      },
                child: const Text(
                  'Ver Mi Hoja de Ruta',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// PANTALLA 2: HOJA DE RUTA DEL CONDUCTOR
class HojaRutaScreen extends StatelessWidget {
  final String placa;
  const HojaRutaScreen({super.key, required this.placa});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> clientes = [
      {
        'codigo': '102585',
        'nombre': 'ARDILA V. SINDY C. CL 17',
        'direccion': 'CL 17 9 16',
        'nota': '',
        'estado': 'Entregado'
      },
      {
        'codigo': '607098',
        'nombre': 'BENITEZ MENDIVELSO CAMILO',
        'direccion': 'CR 5 16 42',
        'nota': 'Entregar de 6am a 8am',
        'estado': 'Pendiente'
      },
      {
        'codigo': '600501',
        'nombre': 'DUMMY BELLA SUIZA 127',
        'direccion': 'CR 7A 127 33',
        'nota': 'Entrega 05:00 am',
        'estado': 'Pendiente'
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text('Ruta: $placa',
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
                fontSize: 18)),
        backgroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: clientes.length,
        itemBuilder: (context, index) {
          final cliente = clientes[index];
          final bool isEntregado = cliente['estado'] == 'Entregado';

          return Card(
            margin: const EdgeInsets.only(bottom: 14),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16)),
            elevation: 2,
            shadowColor: Colors.black12,
            child: Container(
              decoration: BoxDecoration(
                border: Border(
                  left: BorderSide(
                    width: 6,
                    color: isEntregado
                        ? const Color(0xFF10B981)
                        : const Color(0xFFF59E0B),
                  ),
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('#${cliente['codigo']}',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF2563EB),
                                fontFamily: 'monospace')),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isEntregado
                                ? const Color(0xFFECFDF5)
                                : const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            cliente['estado']!,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isEntregado
                                  ? const Color(0xFF047857)
                                  : const Color(0xFFB45309),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(cliente['nombre']!,
                        style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E293B))),
                    const SizedBox(height: 4),
                    Text('📍 ${cliente['direccion']}',
                        style: const TextStyle(
                            fontSize: 13, color: Color(0xFF64748B))),
                    if (cliente['nota']!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(8)),
                        child: Text('⚠️ ${cliente['nota']}',
                            style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF92400E),
                                fontWeight: FontWeight.w600)),
                      ),
                    ],
                    const SizedBox(height: 16),
                    if (!isEntregado)
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                side: const BorderSide(
                                    color: Color(0xFFEF4444)),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: () {},
                              icon: const Icon(Icons.report_problem,
                                  color: Color(0xFFEF4444), size: 18),
                              label: const Text('Novedad',
                                  style: TextStyle(
                                      color: Color(0xFFEF4444),
                                      fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                                elevation: 0,
                              ),
                              onPressed: () {
                                // Plugin de cámara + subida a Supabase
                              },
                              icon: const Icon(Icons.camera_alt,
                                  color: Colors.white, size: 18),
                              label: const Text('Tomar Foto',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

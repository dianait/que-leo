#!/bin/bash

# Script para configurar variables de entorno en Vercel
# Asegúrate de estar logueado en Vercel antes de ejecutar este script (vercel login)

echo "Configurando variables de entorno para bases de datos en Vercel..."

# Preguntar qué base de datos desea configurar
echo "¿Qué base de datos quieres configurar?"
echo "1. Supabase (PostgreSQL) - RECOMENDADO (tiene plan gratuito)"
echo "2. PlanetScale (MySQL) - REQUIERE PLAN DE PAGO"
echo -n "Selecciona una opción (1-2): "
read DB_OPTION

if [ "$DB_OPTION" = "1" ]; then
  echo "Configurando Supabase PostgreSQL..."
  
  # Solicitar las credenciales de Supabase
  echo -n "Ingresa la URL de conexión completa (desde el dashboard de Supabase > Database): "
  read DB_URL
  
  echo -n "Ingresa la contraseña (establecida al crear el proyecto): "
  read -s DB_PASSWORD
  echo ""
  
  # Configurar las variables en Vercel
  echo "Configurando variables de entorno en Vercel..."
  vercel env add DATABASE_URL "$DB_URL"
  vercel env add DATABASE_PASSWORD "$DB_PASSWORD"
  
elif [ "$DB_OPTION" = "2" ]; then
  echo "Configurando PlanetScale MySQL..."
  
  # Solicitar las credenciales de PlanetScale
  echo -n "Ingresa el host de PlanetScale (ejemplo: us-east.connect.psdb.cloud): "
  read DB_HOST
  
  echo -n "Ingresa el nombre de usuario: "
  read DB_USER
  
  echo -n "Ingresa la contraseña: "
  read -s DB_PASSWORD
  echo ""
  
  echo -n "Ingresa el nombre de la base de datos (presiona Enter para 'article_reader'): "
  read DB_NAME
  DB_NAME=${DB_NAME:-article_reader}
  
  # Configurar las variables en Vercel
  echo "Configurando variables de entorno en Vercel..."
  vercel env add DATABASE_HOST "$DB_HOST"
  vercel env add DATABASE_USERNAME "$DB_USER"
  vercel env add DATABASE_PASSWORD "$DB_PASSWORD"
  vercel env add DATABASE_NAME "$DB_NAME"
else
  echo "Opción no válida. Saliendo."
  exit 1
fi

# Preguntar si quiere habilitar el uso de DB en el cliente
echo -n "¿Quieres habilitar el uso de la base de datos en el cliente? (s/n): "
read USE_DB_CLIENT

if [ "$USE_DB_CLIENT" = "s" ] || [ "$USE_DB_CLIENT" = "S" ]; then
  vercel env add VITE_USE_DB "true"
fi

echo "Variables de entorno configuradas correctamente."
echo "Asegúrate de implementar estos cambios ejecutando: vercel --prod"

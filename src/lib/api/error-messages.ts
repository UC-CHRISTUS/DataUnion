/**
 * Utility to translate database and API errors into user-friendly messages
 */

interface PostgresError {
  code?: string;
  message?: string;
  detail?: string;
  constraint?: string;
}

/**
 * Translates PostgreSQL error codes and messages into user-friendly Spanish messages
 */
export function getUserFriendlyError(error: any): string {
  // Handle PostgreSQL errors
  if (error?.code) {
    switch (error.code) {
      case '23505': // unique_violation
        if (error.constraint?.includes('episodio') || error.detail?.includes('episodio')) {
          const match = error.detail?.match(/\(episodio\)=\((\d+)\)/);
          const episodio = match ? match[1] : '';
          return episodio 
            ? `El número de episodio ${episodio} ya existe en el sistema. Por favor, verifica que no estés subiendo un archivo duplicado.`
            : 'Uno o más números de episodio ya existen en el sistema. Por favor, verifica que no estés subiendo un archivo duplicado.';
        }
        if (error.constraint?.includes('rut')) {
          return 'Ya existe un paciente con este RUT en el episodio actual.';
        }
        return 'Ya existe un registro con estos datos. Por favor, verifica la información.';

      case '23503': // foreign_key_violation
        return 'Error de referencia: algunos datos relacionados no existen en el sistema.';

      case '23502': // not_null_violation
        const column = error.column || 'requerido';
        return `Falta información obligatoria: ${column}. Por favor, verifica que el archivo tenga todos los datos necesarios.`;

      case '23514': // check_constraint_violation
        return 'Los datos no cumplen con las reglas de validación. Por favor, revisa el formato del archivo.';

      case '22P02': // invalid_text_representation
        return 'El formato de algunos datos no es válido. Por favor, verifica que los números y fechas estén correctos.';

      case '42P01': // undefined_table
        return 'Error de configuración del sistema. Por favor, contacta al administrador.';

      case '42703': // undefined_column
        return 'El formato del archivo no coincide con el esperado. Asegúrate de usar la plantilla correcta descargada desde SIGESA.';

      case '08006': // connection_failure
      case '08003': // connection_does_not_exist
        return 'Error de conexión con la base de datos. Por favor, intenta nuevamente.';

      case '40001': // serialization_failure
        return 'El sistema está procesando otra operación. Por favor, espera un momento e intenta nuevamente.';

      case '53300': // too_many_connections
        return 'El sistema está temporalmente saturado. Por favor, intenta en unos minutos.';
    }
  }

  // Handle common application errors
  const errorMessage = error?.message || String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // File format errors
  if (lowerMessage.includes('no valid rows') || 
      lowerMessage.includes('formato') ||
      lowerMessage.includes('excel')) {
    return 'El archivo no tiene el formato correcto. Debe subir un archivo Excel descargado desde SIGESA con datos válidos.';
  }

  // Workflow errors
  if (lowerMessage.includes('workflow') || lowerMessage.includes('activo')) {
    return 'Ya existe un archivo en proceso. Por favor, completa el flujo actual antes de subir uno nuevo.';
  }

  // Authentication errors
  if (lowerMessage.includes('auth') || 
      lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('no autorizado')) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
  }

  // Permission errors
  if (lowerMessage.includes('permission') || 
      lowerMessage.includes('permiso') ||
      lowerMessage.includes('forbidden')) {
    return 'No tienes permisos para realizar esta acción.';
  }

  // Network errors
  if (lowerMessage.includes('network') || 
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('timeout')) {
    return 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
  }

  // File size errors
  if (lowerMessage.includes('file size') || 
      lowerMessage.includes('too large') ||
      lowerMessage.includes('demasiado grande')) {
    return 'El archivo es demasiado grande. El tamaño máximo permitido es 50 MB.';
  }

  // Default messages based on HTTP status if available
  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'La solicitud contiene datos inválidos. Por favor, verifica el archivo.';
      case 401:
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no existe.';
      case 409:
        return 'Conflicto: los datos ya existen o están siendo procesados.';
      case 413:
        return 'El archivo es demasiado grande.';
      case 422:
        return 'Los datos proporcionados no son válidos.';
      case 500:
        return 'Error interno del servidor. Por favor, intenta nuevamente más tarde.';
      case 503:
        return 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.';
    }
  }

  // Fallback to original message if it's user-friendly enough
  if (errorMessage && errorMessage.length < 200 && !errorMessage.includes('Error:')) {
    return errorMessage;
  }

  // Ultimate fallback
  return 'Ocurrió un error al procesar el archivo. Por favor, verifica los datos e intenta nuevamente.';
}

/**
 * Extract the most relevant error message from various error formats
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error) {
    return typeof error.error === 'string' ? error.error : error.error.message;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  return 'Error desconocido';
}

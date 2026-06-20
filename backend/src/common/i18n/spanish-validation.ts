import { BadRequestException, ValidationError } from '@nestjs/common';

const fieldNames: Record<string, string> = {
  email: 'correo',
  password: 'contraseña',
  firstName: 'nombre',
  lastName: 'apellido',
  title: 'título',
  content: 'contenido',
  description: 'descripción',
  bio: 'biografía',
  name: 'nombre',
  role: 'rol',
  department: 'departamento',
  career: 'carrera',
  interests: 'intereses',
  message: 'mensaje',
  startDate: 'fecha de inicio',
  endDate: 'fecha de fin',
  location: 'ubicación',
};

function fieldLabel(property: string): string {
  return fieldNames[property] ?? property;
}

function translateConstraint(property: string, key: string, original: string): string {
  const field = fieldLabel(property);
  const num = (original.match(/\d+/) ?? [])[0];

  switch (key) {
    case 'isNotEmpty':
      return `El campo ${field} es obligatorio`;
    case 'isEmail':
      return `El campo ${field} debe ser un correo válido`;
    case 'isString':
      return `El campo ${field} debe ser texto`;
    case 'isInt':
    case 'isNumber':
      return `El campo ${field} debe ser un número`;
    case 'isPositive':
      return `El campo ${field} debe ser un número positivo`;
    case 'isBoolean':
      return `El campo ${field} debe ser verdadero o falso`;
    case 'isArray':
      return `El campo ${field} debe ser una lista`;
    case 'isEnum':
      return `El campo ${field} tiene un valor no permitido`;
    case 'isUUID':
      return `El campo ${field} debe ser un identificador válido`;
    case 'isUrl':
      return `El campo ${field} debe ser una URL válida`;
    case 'isDate':
    case 'isDateString':
      return `El campo ${field} debe ser una fecha válida`;
    case 'minLength':
      return `El campo ${field} debe tener al menos ${num} caracteres`;
    case 'maxLength':
      return `El campo ${field} no debe superar ${num} caracteres`;
    case 'min':
      return `El campo ${field} debe ser como mínimo ${num}`;
    case 'max':
      return `El campo ${field} debe ser como máximo ${num}`;
    case 'arrayMinSize':
      return `El campo ${field} debe tener al menos ${num} elementos`;
    case 'arrayMaxSize':
      return `El campo ${field} no debe tener más de ${num} elementos`;
    case 'matches':
      return `El campo ${field} no tiene un formato válido`;
    default:
      return `El campo ${field} no es válido`;
  }
}

export function spanishValidationFactory(errors: ValidationError[]): BadRequestException {
  const messages: string[] = [];

  const walk = (items: ValidationError[]): void => {
    for (const error of items) {
      if (error.constraints) {
        for (const [key, original] of Object.entries(error.constraints)) {
          messages.push(translateConstraint(error.property, key, original));
        }
      }
      if (error.children && error.children.length > 0) {
        walk(error.children);
      }
    }
  };

  walk(errors);
  return new BadRequestException(messages);
}

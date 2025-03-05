export default function (errors: Array<any>) {  
  if (Array.isArray(errors) && errors.length) {
    return errors.join(". ")
  }

  return errors;
}
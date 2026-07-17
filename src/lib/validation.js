// Every password created anywhere in Teamify (master, client owner, or
// employee accounts later) must mix all four character classes below.
export function passwordRules(pw = '') {
  return [
    { id: 'length', label: 'At least 8 characters', ok: pw.length >= 8 },
    { id: 'upper', label: 'One uppercase letter (A-Z)', ok: /[A-Z]/.test(pw) },
    { id: 'lower', label: 'One lowercase letter (a-z)', ok: /[a-z]/.test(pw) },
    { id: 'number', label: 'One number (0-9)', ok: /[0-9]/.test(pw) },
    { id: 'special', label: 'One special character (!@#$…)', ok: /[^A-Za-z0-9]/.test(pw) },
  ];
}

export function isPasswordValid(pw = '') {
  return passwordRules(pw).every((r) => r.ok);
}

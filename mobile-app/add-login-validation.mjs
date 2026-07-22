import fs from 'fs';

const loginPath = 'c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/login.tsx';
let content = fs.readFileSync(loginPath, 'utf-8');

// 1. Add state for errors and touched
content = content.replace(
  /const \[loading, setLoading\] = useState\(false\);/,
  `const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };
`
);

// 2. Update handleLogin to use validate()
content = content.replace(
  /  const handleLogin = async \(\) => \{\n    if \(\!email\.trim\(\) \|\| \!password\) \{\n      Alert\.alert\('Error', 'Please enter email and password\.'\);\n      return;\n    \}\n/,
  `  const handleLogin = async () => {
    const isValid = validate();
    setTouched({ email: true, password: true });
    
    if (!isValid) return;
`
);

// 3. Add error messages below inputs
// Email
content = content.replace(
  /<TextInput\n\s+placeholder="you@example\.com"\n\s+placeholderTextColor="#94a3b8"\n\s+style=\{styles\.inputText\}\n\s+value=\{email\}\n\s+onChangeText=\{setEmail\}\n\s+keyboardType="email-address"\n\s+autoCapitalize="none"\n\s+\/>\n\s+<\/View>/,
  `<TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#94a3b8"
                    style={[styles.inputText, touched.email && errors.email ? styles.inputError : null]}
                    value={email}
                    onChangeText={(val) => { setEmail(val.trim()); if(touched.email) validate(); }}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>`
);

// Password
content = content.replace(
  /<TextInput\n\s+placeholder="••••••"\n\s+placeholderTextColor="#94a3b8"\n\s+style=\{styles\.inputText\}\n\s+value=\{password\}\n\s+onChangeText=\{setPassword\}\n\s+secureTextEntry\n\s+\/>\n\s+<\/View>/,
  `<TextInput
                    placeholder="••••••"
                    placeholderTextColor="#94a3b8"
                    style={[styles.inputText, touched.password && errors.password ? styles.inputError : null]}
                    value={password}
                    onChangeText={(val) => { setPassword(val); if(touched.password) validate(); }}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry
                  />
                  {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>`
);

// Add styles
content = content.replace(
  /inputText: \{/,
  `inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    marginLeft: 4,
  },
  inputText: {`
);

fs.writeFileSync(loginPath, content);
console.log('Login inline validation added');

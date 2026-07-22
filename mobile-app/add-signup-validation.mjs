import fs from 'fs';

const signupPath = 'c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/signup.tsx';
let content = fs.readFileSync(signupPath, 'utf-8');

// 1. Add state for errors and touched
content = content.replace(
  /const \[loading, setLoading\] = useState\(false\);/,
  `const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

// 2. Update handleSignup to use validate()
content = content.replace(
  /  const handleSignup = async \(\) => \{\n    if \(\!firstName \|\| \!lastName \|\| \!email \|\| \!password\) \{\n      Alert\.alert\('Error', 'Please fill in all fields\.'\);\n      return;\n    \}\n    if \(\!agreed\) \{\n      Alert\.alert\('Error', 'You must agree to the Terms and Privacy Policies\.'\);\n      return;\n    \}\n/,
  `  const handleSignup = async () => {
    const isValid = validate();
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true });
    
    if (!isValid) return;
    
    if (!agreed) {
      Alert.alert('Error', 'You must agree to the Terms and Privacy Policies.');
      return;
    }
`
);

// 3. Add error messages below inputs
// First Name
content = content.replace(
  /<TextInput\n\s+placeholder="Nikhil"\n\s+placeholderTextColor="#94a3b8"\n\s+style=\{styles\.inputText\}\n\s+value=\{firstName\}\n\s+onChangeText=\{setFirstName\}\n\s+\/>\n\s+<\/View>/,
  `<TextInput
                      placeholder="Nikhil"
                      placeholderTextColor="#94a3b8"
                      style={[styles.inputText, touched.firstName && errors.firstName ? styles.inputError : null]}
                      value={firstName}
                      onChangeText={(val) => { setFirstName(val); if(touched.firstName) validate(); }}
                      onBlur={() => handleBlur('firstName')}
                    />
                    {touched.firstName && errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                  </View>`
);

// Last Name
content = content.replace(
  /<TextInput\n\s+placeholder="Harake"\n\s+placeholderTextColor="#94a3b8"\n\s+style=\{styles\.inputText\}\n\s+value=\{lastName\}\n\s+onChangeText=\{setLastName\}\n\s+\/>\n\s+<\/View>/,
  `<TextInput
                      placeholder="Harake"
                      placeholderTextColor="#94a3b8"
                      style={[styles.inputText, touched.lastName && errors.lastName ? styles.inputError : null]}
                      value={lastName}
                      onChangeText={(val) => { setLastName(val); if(touched.lastName) validate(); }}
                      onBlur={() => handleBlur('lastName')}
                    />
                    {touched.lastName && errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                  </View>`
);

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
  /<TextInput\n\s+placeholder="••••••••"\n\s+placeholderTextColor="#94a3b8"\n\s+style=\{styles\.inputText\}\n\s+value=\{password\}\n\s+onChangeText=\{setPassword\}\n\s+secureTextEntry\n\s+\/>\n\s+<\/View>/,
  `<TextInput
                      placeholder="••••••••"
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

// Confirm Password
content = content.replace(
  /<TextInput\n\s+placeholder="••••••••"\n\s+placeholderTextColor="#94a3b8"\n\s+style=\{styles\.inputText\}\n\s+value=\{confirmPassword\}\n\s+onChangeText=\{setConfirmPassword\}\n\s+secureTextEntry\n\s+\/>\n\s+<\/View>/,
  `<TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      style={[styles.inputText, touched.confirmPassword && errors.confirmPassword ? styles.inputError : null]}
                      value={confirmPassword}
                      onChangeText={(val) => { setConfirmPassword(val); if(touched.confirmPassword) validate(); }}
                      onBlur={() => handleBlur('confirmPassword')}
                      secureTextEntry
                    />
                    {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
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

fs.writeFileSync(signupPath, content);
console.log('Signup inline validation added');

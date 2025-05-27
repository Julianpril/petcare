// app/register.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        } else if (formData.username.length < 3) {
            newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Simulando registro exitoso
            console.log('Registrando usuario:', formData);

            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 2000));

            // En una app real, aquí harías la llamada a tu API de registro
            // const response = await fetch('tu-api-de-registro', { ... });

            console.log('Registro exitoso');

            // Redirigir al login después del registro exitoso
            router.push('/login');

        } catch (error) {
            console.error('Error en registro:', error);
            setErrors({ general: 'Error al registrar usuario. Intenta nuevamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Crear Cuenta</Text>

                {errors.general && <Text style={styles.error}>{errors.general}</Text>}

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Nombre completo"
                        placeholderTextColor="#AAB4C0"
                        value={formData.fullName}
                        onChangeText={(text) => updateField('fullName', text)}
                        style={[styles.input, errors.fullName && styles.inputError]}
                        autoCapitalize="words"
                        autoCorrect={false}
                    />
                    {errors.fullName && <Text style={styles.fieldError}>{errors.fullName}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Nombre de usuario"
                        placeholderTextColor="#AAB4C0"
                        value={formData.username}
                        onChangeText={(text) => updateField('username', text)}
                        style={[styles.input, errors.username && styles.inputError]}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {errors.username && <Text style={styles.fieldError}>{errors.username}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#AAB4C0"
                        value={formData.email}
                        onChangeText={(text) => updateField('email', text)}
                        style={[styles.input, errors.email && styles.inputError]}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                    />
                    {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Teléfono (opcional)"
                        placeholderTextColor="#AAB4C0"
                        value={formData.phone}
                        onChangeText={(text) => updateField('phone', text)}
                        style={styles.input}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Contraseña"
                        placeholderTextColor="#AAB4C0"
                        secureTextEntry
                        value={formData.password}
                        onChangeText={(text) => updateField('password', text)}
                        style={[styles.input, errors.password && styles.inputError]}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Confirmar contraseña"
                        placeholderTextColor="#AAB4C0"
                        secureTextEntry
                        value={formData.confirmPassword}
                        onChangeText={(text) => updateField('confirmPassword', text)}
                        style={[styles.input, errors.confirmPassword && styles.inputError]}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.loginButtonText}>
                        ¿Ya tienes cuenta? Inicia sesión
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#122432',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1E2A38',
        padding: 30,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#EAEAEA',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#2A3A4A',
        color: '#EAEAEA',
        fontSize: 16,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3A4A5A',
    },
    inputError: {
        borderColor: '#ff6f61',
        borderWidth: 2,
    },
    button: {
        backgroundColor: '#ff6f61',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        backgroundColor: '#666',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginButton: {
        backgroundColor: 'transparent',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#47a9ff',
    },
    loginButtonText: {
        color: '#47a9ff',
        fontSize: 16,
    },
    error: {
        color: '#ff6f61',
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 14,
    },
    fieldError: {
        color: '#ff6f61',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
});
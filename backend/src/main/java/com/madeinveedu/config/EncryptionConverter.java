package com.madeinveedu.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Converter
@Component
public class EncryptionConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private final SecretKeySpec secretKey;

    public EncryptionConverter(@Value("${app.encryption.secret-key:VeeduMadeSecureKeyEncryption2026}") String secret) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(secret.getBytes(StandardCharsets.UTF_8));
            this.secretKey = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize EncryptionConverter key spec", e);
        }
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new java.security.SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            javax.crypto.spec.GCMParameterSpec parameterSpec = new javax.crypto.spec.GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
            byte[] encryptedBytes = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
            
            byte[] cipherTextWithIv = new byte[GCM_IV_LENGTH + encryptedBytes.length];
            System.arraycopy(iv, 0, cipherTextWithIv, 0, GCM_IV_LENGTH);
            System.arraycopy(encryptedBytes, 0, cipherTextWithIv, GCM_IV_LENGTH, encryptedBytes.length);
            
            return Base64.getEncoder().encodeToString(cipherTextWithIv);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting field in Database column conversion", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            byte[] cipherTextWithIv = Base64.getDecoder().decode(dbData);
            if (cipherTextWithIv.length < GCM_IV_LENGTH) {
                return null;
            }
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(cipherTextWithIv, 0, iv, 0, GCM_IV_LENGTH);
            byte[] encryptedBytes = new byte[cipherTextWithIv.length - GCM_IV_LENGTH];
            System.arraycopy(cipherTextWithIv, GCM_IV_LENGTH, encryptedBytes, 0, encryptedBytes.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            javax.crypto.spec.GCMParameterSpec parameterSpec = new javax.crypto.spec.GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting field in Entity attribute conversion", e);
        }
    }
}

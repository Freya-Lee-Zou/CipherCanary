import base64
import hashlib
from datetime import datetime
from typing import Optional
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import serialization as crypto_serialization
import os

class CryptoService:
    def __init__(self):
        self.supported_algorithms = {
            "aes-256-gcm": self._encrypt_aes_256_gcm,
            "chacha20-poly1305": self._encrypt_chacha20_poly1305,
            "rsa-4096": self._encrypt_rsa_4096,
            "ed25519": self._encrypt_ed25519
        }
        
        self.decrypt_algorithms = {
            "aes-256-gcm": self._decrypt_aes_256_gcm,
            "chacha20-poly1305": self._decrypt_chacha20_poly1305,
            "rsa-4096": self._decrypt_rsa_4096,
            "ed25519": self._decrypt_ed25519
        }
    
    def encrypt_data(self, data: str, algorithm: str, key_id: Optional[str], user_id: str) -> dict:
        """Encrypt data using specified algorithm"""
        if algorithm not in self.supported_algorithms:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        # Convert string to bytes
        data_bytes = data.encode('utf-8')
        
        # Generate hash for audit
        input_hash = hashlib.sha256(data_bytes).hexdigest()
        
        # Encrypt data
        encrypted_result = self.supported_algorithms[algorithm](data_bytes)
        
        # Generate output hash
        output_bytes = base64.b64encode(encrypted_result['encrypted_data'])
        output_hash = hashlib.sha256(output_bytes).hexdigest()
        
        return {
            "encrypted_data": base64.b64encode(encrypted_result['encrypted_data']).decode('utf-8'),
            "algorithm": algorithm,
            "key_id": key_id,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "success",
            "input_hash": input_hash,
            "output_hash": output_hash,
            "metadata": encrypted_result.get('metadata', {})
        }
    
    def decrypt_data(self, encrypted_data: str, algorithm: str, key_id: Optional[str], user_id: str) -> dict:
        """Decrypt data using specified algorithm"""
        if algorithm not in self.decrypt_algorithms:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        try:
            # Decode base64 encrypted data
            encrypted_bytes = base64.b64decode(encrypted_data)
            
            # Generate input hash for audit
            input_hash = hashlib.sha256(encrypted_bytes).hexdigest()
            
            # Decrypt data
            decrypted_data = self.decrypt_algorithms[algorithm](encrypted_bytes, key_id)
            
            # Generate output hash
            output_hash = hashlib.sha256(decrypted_data).hexdigest()
            
            return {
                "decrypted_data": decrypted_data.decode('utf-8'),
                "algorithm": algorithm,
                "key_id": key_id,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success",
                "input_hash": input_hash,
                "output_hash": output_hash
            }
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    def _encrypt_aes_256_gcm(self, data: bytes) -> dict:
        """Encrypt data using AES-256-GCM"""
        # Generate random key and IV
        key = os.urandom(32)  # 256 bits
        iv = os.urandom(12)   # 96 bits for GCM
        
        # Create cipher
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv))
        encryptor = cipher.encryptor()
        
        # Encrypt data
        encrypted_data = encryptor.update(data) + encryptor.finalize()
        
        # Get authentication tag
        tag = encryptor.tag
        
        # Combine encrypted data and tag
        result = encrypted_data + tag
        
        return {
            "encrypted_data": result,
            "metadata": {
                "key": base64.b64encode(key).decode('utf-8'),
                "iv": base64.b64encode(iv).decode('utf-8'),
                "tag": base64.b64encode(tag).decode('utf-8')
            }
        }
    
    def _decrypt_aes_256_gcm(self, encrypted_data: bytes, key_id: Optional[str]) -> bytes:
        """Decrypt data using AES-256-GCM"""
        # For demo purposes, we'll use a hardcoded key
        # In production, this would be retrieved from the key management system
        key = base64.b64decode("your-hardcoded-key-here")  # 32 bytes
        iv = base64.b64decode("your-hardcoded-iv-here")    # 12 bytes
        
        # Extract tag (last 16 bytes)
        tag = encrypted_data[-16:]
        ciphertext = encrypted_data[:-16]
        
        # Create cipher
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag))
        decryptor = cipher.decryptor()
        
        # Decrypt data
        decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
        
        return decrypted_data
    
    def _encrypt_chacha20_poly1305(self, data: bytes) -> dict:
        """Encrypt data using ChaCha20-Poly1305"""
        # Generate random key and nonce
        key = os.urandom(32)  # 256 bits
        nonce = os.urandom(12)  # 96 bits
        
        # Create cipher
        cipher = Cipher(algorithms.ChaCha20(key, nonce), modes.Poly1305())
        encryptor = cipher.encryptor()
        
        # Encrypt data
        encrypted_data = encryptor.update(data) + encryptor.finalize()
        
        return {
            "encrypted_data": encrypted_data,
            "metadata": {
                "key": base64.b64encode(key).decode('utf-8'),
                "nonce": base64.b64encode(nonce).decode('utf-8')
            }
        }
    
    def _decrypt_chacha20_poly1305(self, encrypted_data: bytes, key_id: Optional[str]) -> bytes:
        """Decrypt data using ChaCha20-Poly1305"""
        # For demo purposes, using hardcoded key
        key = base64.b64decode("your-hardcoded-chacha20-key")
        nonce = base64.b64decode("your-hardcoded-chacha20-nonce")
        
        # Create cipher
        cipher = Cipher(algorithms.ChaCha20(key, nonce), modes.Poly1305())
        decryptor = cipher.decryptor()
        
        # Decrypt data
        decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()
        
        return decrypted_data
    
    def _encrypt_rsa_4096(self, data: bytes) -> dict:
        """Encrypt data using RSA-4096"""
        # Generate RSA key pair
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096
        )
        public_key = private_key.public_key()
        
        # Encrypt data
        encrypted_data = public_key.encrypt(
            data,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        return {
            "encrypted_data": encrypted_data,
            "metadata": {
                "public_key": public_key.public_bytes(
                    encoding=crypto_serialization.Encoding.PEM,
                    format=crypto_serialization.PublicFormat.SubjectPublicKeyInfo
                ).decode('utf-8')
            }
        }
    
    def _decrypt_rsa_4096(self, encrypted_data: bytes, key_id: Optional[str]) -> bytes:
        """Decrypt data using RSA-4096"""
        # For demo purposes, this would use the private key from key management
        raise NotImplementedError("RSA decryption requires private key from key management system")
    
    def _encrypt_ed25519(self, data: bytes) -> dict:
        """Sign data using Ed25519"""
        # Ed25519 is for signing, not encryption
        # This is a placeholder for signature functionality
        return {
            "encrypted_data": data,  # Not actually encrypted
            "metadata": {
                "algorithm": "ed25519-signature",
                "note": "Ed25519 is for digital signatures, not encryption"
            }
        }
    
    def _decrypt_ed25519(self, encrypted_data: bytes, key_id: Optional[str]) -> bytes:
        """Verify Ed25519 signature"""
        # This would verify the signature
        return encrypted_data  # Return original data for demo

# Create service instance
crypto_service = CryptoService()

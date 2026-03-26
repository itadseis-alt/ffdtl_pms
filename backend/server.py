from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Query, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import JWTError, jwt
import base64
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'falintil-fdtl-pms-secret-key-2026')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Create the main app
app = FastAPI(title="FALINTIL-FDTL PMS API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== CONSTANTS ====================
POSTOS = {
    "Oficiais Generais": ["General", "Almirante", "Tenente General", "Vice Almirante", "Major General", "Contra Almirante", "Brigadeiro General", "Comodoro"],
    "Oficiais Superiores": ["Coronel", "Capitão-de-mar-e-guerra", "Tenente-Coronel", "Capitão de Fragata", "Major", "Capitão Tenente"],
    "Oficiais Capitães e Subalternos": ["Capitão", "Primeiro Tenente", "Tenente", "Segundo Tenente", "Alferes"],
    "Sargentos": ["Sargento Mor", "Sargento Chefe", "Sargento Ajudante", "Primeiro Sargento", "Segundo Sargento"],
    "Praças": ["Cabo de Seção", "Cabo", "Cabo Adjunto", "Primeiro Marinheiro", "Segundo Cabo", "Primeiro Grumete", "Soldado", "Segundo Grumete", "Soldado Instruendo"]
}

UNIDADES = [
    "Quartel General", "Componente Força Terrestre (CFT)", "Componente Força Naval (CFN)",
    "Componente Aérea Ligeira (CAL)", "Força Apoio Geral (FAG)", "Unidade Apoio Serviço (UAS)",
    "Centro de Instrução do Comandante Nicolau Lobato (CICNL)", "Unidade de Polícia Militar (PM)",
    "Unidade FALINTIL (UF)", "1º Batalhão da CFT", "2º Batalhão da CFT", "Companhia de Transmissões",
    "Companhia de Engenharia", "Corpo Fuzileiros"
]

MUNICIPIOS = ["Aileu", "Ainaro", "Atauro", "Baucau", "Bobonaro", "Covalima/Suai", "Dili", "Ermera", "Lautem", "Liquiça", "Manatuto", "Manufahi/Same", "Oecusse", "Viqueque"]

ESTADO_CIVIL = ["Solteiro", "Solteira", "Casado", "Casada", "Barlaquedo", "Barlaqueda", "Divorciado", "Divorciada", "Registro Civil ou União de Facto"]

TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

GRAUS_ESTUDO = ["Doutorado", "Mestrado", "Licenciado", "Bacharelato", "D3", "D1", "Secundaria", "Pre-secundaria", "Primaria"]

TIPOS_PUNICAO = ["Repreensão", "Repreensão Agravada", "Detenção", "Prisão Disciplinar", "Prisão Disciplinar Agravada", "Reforma Compulsiva", "Separação do Serviço"]

TIPOS_LICENCA = ["Para Ferias", "Por Merito", "Por Falecimento de Familiar", "Por Casamento", "Registada", "Por Maternidade", "Por Paternidade", "Por Estudos", "Licença ilimitada", "Outras de natureza específica", "Licença Trimestral", "Licenca de Transferencia"]

CARTAO_CONDUCAO = ["A1", "A2", "B1", "B2", "C1", "C2"]

MEMBER_STATUS = ["Ativo", "Falecido", "Separação do Serviço", "Reserva", "Reforma"]

# ==================== MODELS ====================
class UserCreate(BaseModel):
    nome: str
    sobrenome: str
    email: EmailStr
    senha: str
    confirmacao_senha: str
    role: str = "rh"
    foto_perfil: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    sobrenome: Optional[str] = None
    email: Optional[EmailStr] = None
    foto_perfil: Optional[str] = None
    is_active: Optional[bool] = None

class PasswordChange(BaseModel):
    senha_atual: Optional[str] = None
    nova_senha: str
    confirmacao_senha: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class MemberCreate(BaseModel):
    # Step 1: Dados Pessoais
    nome: str
    nim: str
    posto: str
    atual_funcao: Optional[str] = None
    unidade: str
    sexo: str
    data_nascimento: str
    naturalidade: str
    estado_civil: str
    residencia_atual: Optional[str] = None
    municipio: str
    nacionalidade: str
    numero_contacto: Optional[str] = None
    email: Optional[str] = None
    tipo_sanguineo: str
    foto_perfil: Optional[str] = None
    status: str = "Ativo"
    
    # Step 2: Documentos
    payroll_no: Optional[str] = None
    payroll_anexo: Optional[str] = None
    niss_no: Optional[str] = None
    niss_anexo: Optional[str] = None
    utente_no: Optional[str] = None
    utente_anexo: Optional[str] = None
    cartao_eleitoral: Optional[str] = None
    cartao_eleitoral_anexo: Optional[str] = None
    bilhete_identidade: Optional[str] = None
    bilhete_identidade_anexo: Optional[str] = None
    certidao_rdtl: Optional[str] = None
    certidao_rdtl_anexo: Optional[str] = None
    passaporte: Optional[str] = None
    passaporte_anexo: Optional[str] = None
    cartao_conducao: Optional[List[str]] = None
    cartao_conducao_anexo: Optional[str] = None
    
    # Step 3: Habilitações Literárias
    habilitacoes: Optional[List[Dict]] = None
    
    # Step 4: Cursos Informais
    cursos_informais: Optional[List[Dict]] = None
    
    # Step 5: Formação Militar
    formacao_militar: Optional[List[Dict]] = None
    
    # Step 6: Carreira
    carreira: Optional[List[Dict]] = None
    
    # Step 7: Experiência de Serviço
    experiencia_servico: Optional[List[Dict]] = None
    
    # Step 8: Habilidade de Língua
    habilidade_lingua: Optional[List[Dict]] = None
    
    # Step 9: Conhecimento Informática
    conhecimento_informatica: Optional[str] = None
    outras_informacoes: Optional[str] = None
    informatica_anexo: Optional[str] = None
    
    # Step 10: Situação Disciplinar
    situacao_disciplinar: Optional[List[Dict]] = None
    
    # Step 11: Louvores e Condecorações
    louvores: Optional[List[Dict]] = None
    
    # Step 12: Licenças
    licencas: Optional[List[Dict]] = None
    
    # Step 13: Estado Médico
    estado_medico: Optional[List[Dict]] = None
    
    # Step 14: Afiliação Familiar
    nome_pai: Optional[str] = None
    nome_mae: Optional[str] = None
    nome_conjuge: Optional[str] = None
    filhos: Optional[List[str]] = None
    familia_anexo: Optional[str] = None
    
    # Step 15: Dados Vestuário
    vestuario: Optional[List[Dict]] = None
    
    # Step 16: Equipamentos
    equipamentos: Optional[List[Dict]] = None
    entregas_equipamentos: Optional[List[Dict]] = None

class NotificationCreate(BaseModel):
    user_id: str
    titulo: str
    mensagem: str
    tipo: str = "info"

# ==================== HELPERS ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"user_id": user_id, "is_active": True}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado ou inativo")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

def require_role(allowed_roles: List[str]):
    async def role_checker(user = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Acesso não autorizado")
        return user
    return role_checker

def calculate_age(birth_date_str: str) -> int:
    try:
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        today = datetime.now()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age
    except:
        return 0

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.senha, user["senha_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Usuário desativado")
    
    token = create_access_token({"sub": user["user_id"], "role": user["role"]})
    user_data = {k: v for k, v in user.items() if k != "senha_hash"}
    return TokenResponse(access_token=token, user=user_data)

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "senha_hash"}

@api_router.put("/auth/change-password")
async def change_password(data: PasswordChange, user = Depends(get_current_user)):
    if data.nova_senha != data.confirmacao_senha:
        raise HTTPException(status_code=400, detail="Senhas não coincidem")
    if data.senha_atual and not verify_password(data.senha_atual, user["senha_hash"]):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"senha_hash": hash_password(data.nova_senha), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Senha alterada com sucesso"}

# ==================== USER MANAGEMENT ====================
@api_router.post("/users")
async def create_user(user_data: UserCreate, current_user = Depends(require_role(["admin"]))):
    if user_data.senha != user_data.confirmacao_senha:
        raise HTTPException(status_code=400, detail="Senhas não coincidem")
    
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    user_doc = {
        "user_id": str(uuid.uuid4()),
        "nome": user_data.nome,
        "sobrenome": user_data.sobrenome,
        "email": user_data.email,
        "senha_hash": hash_password(user_data.senha),
        "role": user_data.role,
        "foto_perfil": user_data.foto_perfil,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["user_id"]
    }
    await db.users.insert_one(user_doc)
    return {k: v for k, v in user_doc.items() if k not in ["senha_hash", "_id"]}

@api_router.get("/users")
async def list_users(role: Optional[str] = None, current_user = Depends(require_role(["admin"]))):
    query = {}
    if role:
        query["role"] = role
    users = await db.users.find(query, {"_id": 0, "senha_hash": 0}).to_list(1000)
    return users

@api_router.get("/users/{user_id}")
async def get_user(user_id: str, current_user = Depends(require_role(["admin"]))):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "senha_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, data: UserUpdate, current_user = Depends(require_role(["admin"]))):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.users.update_one({"user_id": user_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário atualizado com sucesso"}

@api_router.put("/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, data: PasswordChange, current_user = Depends(require_role(["admin"]))):
    if data.nova_senha != data.confirmacao_senha:
        raise HTTPException(status_code=400, detail="Senhas não coincidem")
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"senha_hash": hash_password(data.nova_senha), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Senha do usuário alterada com sucesso"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user = Depends(require_role(["admin"]))):
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"message": "Usuário excluído com sucesso"}

# ==================== MEMBER MANAGEMENT ====================
# Rotas específicas primeiro (antes das rotas com parâmetros)
@api_router.get("/members/retirement-alerts")
async def get_retirement_alerts(current_user = Depends(get_current_user)):
    """Get members who are approaching retirement age (58-59 years old)"""
    alerts = []
    
    # Find active members
    active_members = await db.members.find({"status": "Ativo"}, {"_id": 0}).to_list(20000)
    
    for member in active_members:
        age = calculate_age(member.get("data_nascimento", ""))
        if 58 <= age < 60:
            years_to_retirement = 60 - age
            alerts.append({
                "member_id": member["member_id"],
                "nome": member["nome"],
                "nim": member["nim"],
                "idade": age,
                "anos_para_reforma": years_to_retirement,
                "data_nascimento": member["data_nascimento"],
                "unidade": member.get("unidade"),
                "posto": member.get("posto")
            })
    
    return {"total": len(alerts), "alerts": alerts}

@api_router.post("/members/check-retirement")
async def check_and_update_retirement(current_user = Depends(require_role(["admin", "rh"]))):
    """Check and automatically update members who reached retirement age"""
    updated_count = 0
    
    # Find active members
    active_members = await db.members.find({"status": "Ativo"}, {"_id": 0}).to_list(20000)
    
    for member in active_members:
        age = calculate_age(member.get("data_nascimento", ""))
        if age >= 60:
            await db.members.update_one(
                {"member_id": member["member_id"]},
                {"$set": {
                    "status": "Reforma",
                    "status_changed_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            updated_count += 1
            
            # Create notification for admins
            admin_users = await db.users.find({"role": "admin"}, {"_id": 0}).to_list(100)
            for admin in admin_users:
                notif_doc = {
                    "notification_id": str(uuid.uuid4()),
                    "user_id": admin["user_id"],
                    "titulo": "Membro Reformado Automaticamente",
                    "mensagem": f"O membro {member['nome']} (NIM: {member['nim']}) foi movido para Reforma por completar 60 anos.",
                    "tipo": "warning",
                    "lida": False,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.notifications.insert_one(notif_doc)
    
    return {"message": f"{updated_count} membro(s) atualizado(s) para Reforma"}

@api_router.post("/members")
async def create_member(member_data: MemberCreate, current_user = Depends(require_role(["admin", "rh"]))):
    existing = await db.members.find_one({"nim": member_data.nim})
    if existing:
        raise HTTPException(status_code=400, detail="NIM já cadastrado")
    
    member_doc = member_data.model_dump()
    member_doc["member_id"] = str(uuid.uuid4())
    member_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    member_doc["created_by"] = current_user["user_id"]
    member_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Calculate age and check for retirement
    age = calculate_age(member_data.data_nascimento)
    member_doc["idade"] = age
    if age >= 60 and member_doc["status"] == "Ativo":
        member_doc["status"] = "Reforma"
    
    await db.members.insert_one(member_doc)
    del member_doc["_id"]
    return member_doc

@api_router.get("/members")
async def list_members(
    status: Optional[str] = None,
    unidade: Optional[str] = None,
    posto: Optional[str] = None,
    municipio: Optional[str] = None,
    sexo: Optional[str] = None,
    tipo_sanguineo: Optional[str] = None,
    nome: Optional[str] = None,
    nim: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user = Depends(get_current_user)
):
    query = {}
    if status:
        query["status"] = status
    if unidade:
        query["unidade"] = unidade
    if posto:
        query["posto"] = posto
    if municipio:
        query["municipio"] = municipio
    if sexo:
        query["sexo"] = sexo
    if tipo_sanguineo:
        query["tipo_sanguineo"] = tipo_sanguineo
    if nome:
        query["nome"] = {"$regex": nome, "$options": "i"}
    if nim:
        query["nim"] = {"$regex": nim, "$options": "i"}
    
    skip = (page - 1) * limit
    total = await db.members.count_documents(query)
    members = await db.members.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    # Update ages
    for member in members:
        member["idade"] = calculate_age(member.get("data_nascimento", ""))
    
    return {"total": total, "page": page, "limit": limit, "members": members}

@api_router.get("/members/{member_id}")
async def get_member(member_id: str, current_user = Depends(get_current_user)):
    member = await db.members.find_one({"member_id": member_id}, {"_id": 0})
    if not member:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    member["idade"] = calculate_age(member.get("data_nascimento", ""))
    return member

@api_router.put("/members/{member_id}")
async def update_member(member_id: str, data: dict, current_user = Depends(require_role(["admin", "rh"]))):
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_by"] = current_user["user_id"]
    
    # Recalculate age if birth date changed
    if "data_nascimento" in data:
        age = calculate_age(data["data_nascimento"])
        data["idade"] = age
        if age >= 60 and data.get("status", "Ativo") == "Ativo":
            data["status"] = "Reforma"
    
    result = await db.members.update_one({"member_id": member_id}, {"$set": data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    return {"message": "Membro atualizado com sucesso"}

@api_router.delete("/members/{member_id}")
async def delete_member(member_id: str, current_user = Depends(require_role(["admin"]))):
    result = await db.members.delete_one({"member_id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    return {"message": "Membro excluído com sucesso"}

@api_router.put("/members/{member_id}/status")
async def update_member_status(member_id: str, status: str, current_user = Depends(require_role(["admin", "rh"]))):
    if status not in MEMBER_STATUS:
        raise HTTPException(status_code=400, detail="Status inválido")
    
    update_data = {
        "status": status,
        "status_changed_at": datetime.now(timezone.utc).isoformat(),
        "status_changed_by": current_user["user_id"],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.members.update_one({"member_id": member_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Membro não encontrado")
    return {"message": f"Status alterado para {status}"}

# ==================== DASHBOARD & STATISTICS ====================
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user = Depends(get_current_user)):
    total = await db.members.count_documents({})
    ativos = await db.members.count_documents({"status": "Ativo"})
    falecidos = await db.members.count_documents({"status": "Falecido"})
    separacao = await db.members.count_documents({"status": "Separação do Serviço"})
    reserva = await db.members.count_documents({"status": "Reserva"})
    reforma = await db.members.count_documents({"status": "Reforma"})
    
    masculino = await db.members.count_documents({"sexo": "M"})
    feminino = await db.members.count_documents({"sexo": "F"})
    
    # Por unidade
    unidades_pipeline = [
        {"$group": {"_id": "$unidade", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    por_unidade = await db.members.aggregate(unidades_pipeline).to_list(100)
    
    # Por posto
    postos_pipeline = [
        {"$group": {"_id": "$posto", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    por_posto = await db.members.aggregate(postos_pipeline).to_list(100)
    
    # Por tipo sanguíneo
    sangue_pipeline = [
        {"$group": {"_id": "$tipo_sanguineo", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    por_sangue = await db.members.aggregate(sangue_pipeline).to_list(20)
    
    # Por município
    municipio_pipeline = [
        {"$group": {"_id": "$municipio", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    por_municipio = await db.members.aggregate(municipio_pipeline).to_list(20)
    
    return {
        "total": total,
        "por_status": {
            "ativos": ativos,
            "falecidos": falecidos,
            "separacao": separacao,
            "reserva": reserva,
            "reforma": reforma
        },
        "por_sexo": {"masculino": masculino, "feminino": feminino},
        "por_unidade": [{"unidade": u["_id"], "count": u["count"]} for u in por_unidade if u["_id"]],
        "por_posto": [{"posto": p["_id"], "count": p["count"]} for p in por_posto if p["_id"]],
        "por_tipo_sanguineo": [{"tipo": s["_id"], "count": s["count"]} for s in por_sangue if s["_id"]],
        "por_municipio": [{"municipio": m["_id"], "count": m["count"]} for m in por_municipio if m["_id"]]
    }

# ==================== NOTIFICATIONS ====================
@api_router.post("/notifications")
async def create_notification(data: NotificationCreate, current_user = Depends(require_role(["admin", "rh"]))):
    notif_doc = {
        "notification_id": str(uuid.uuid4()),
        "user_id": data.user_id,
        "titulo": data.titulo,
        "mensagem": data.mensagem,
        "tipo": data.tipo,
        "lida": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif_doc)
    del notif_doc["_id"]
    return notif_doc

@api_router.get("/notifications")
async def get_notifications(current_user = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user = Depends(get_current_user)):
    await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": current_user["user_id"]},
        {"$set": {"lida": True}}
    )
    return {"message": "Notificação marcada como lida"}

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user = Depends(get_current_user)):
    count = await db.notifications.count_documents({"user_id": current_user["user_id"], "lida": False})
    return {"count": count}

# ==================== FILE UPLOAD ====================
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user = Depends(require_role(["admin", "rh"]))):
    content = await file.read()
    file_id = str(uuid.uuid4())
    
    # Store file in MongoDB GridFS-like collection
    file_doc = {
        "file_id": file_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "content": base64.b64encode(content).decode('utf-8'),
        "size": len(content),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": current_user["user_id"]
    }
    await db.files.insert_one(file_doc)
    
    return {"file_id": file_id, "filename": file.filename}

@api_router.get("/files/{file_id}")
async def get_file(file_id: str):
    """Get file metadata - public endpoint"""
    file_doc = await db.files.find_one({"file_id": file_id}, {"_id": 0})
    if not file_doc:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return file_doc

@api_router.get("/files/{file_id}/download")
async def download_file(file_id: str):
    """Download file directly - public endpoint for viewing"""
    from fastapi.responses import Response
    
    file_doc = await db.files.find_one({"file_id": file_id}, {"_id": 0})
    if not file_doc:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    content = base64.b64decode(file_doc["content"])
    return Response(
        content=content,
        media_type=file_doc.get("content_type", "application/octet-stream"),
        headers={
            "Content-Disposition": f'inline; filename="{file_doc["filename"]}"'
        }
    )

# ==================== BACKUP ====================
@api_router.post("/backup")
async def create_backup(current_user = Depends(require_role(["admin"]))):
    backup_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Get all collections data
    members = await db.members.find({}, {"_id": 0}).to_list(20000)
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    notifications = await db.notifications.find({}, {"_id": 0}).to_list(10000)
    
    backup_doc = {
        "backup_id": backup_id,
        "created_at": timestamp,
        "created_by": current_user["user_id"],
        "data": {
            "members": members,
            "users": users,
            "notifications": notifications
        },
        "stats": {
            "members_count": len(members),
            "users_count": len(users)
        }
    }
    await db.backups.insert_one(backup_doc)
    
    return {"backup_id": backup_id, "created_at": timestamp, "stats": backup_doc["stats"]}

@api_router.get("/backups")
async def list_backups(current_user = Depends(require_role(["admin"]))):
    backups = await db.backups.find({}, {"_id": 0, "data": 0}).sort("created_at", -1).to_list(100)
    return backups

# ==================== CONSTANTS ENDPOINTS ====================
@api_router.get("/constants/postos")
async def get_postos():
    return POSTOS

@api_router.get("/constants/unidades")
async def get_unidades():
    return UNIDADES

@api_router.get("/constants/municipios")
async def get_municipios():
    return MUNICIPIOS

@api_router.get("/constants/estado-civil")
async def get_estado_civil():
    return ESTADO_CIVIL

@api_router.get("/constants/tipos-sanguineos")
async def get_tipos_sanguineos():
    return TIPOS_SANGUINEOS

@api_router.get("/constants/graus-estudo")
async def get_graus_estudo():
    return GRAUS_ESTUDO

@api_router.get("/constants/tipos-punicao")
async def get_tipos_punicao():
    return TIPOS_PUNICAO

@api_router.get("/constants/tipos-licenca")
async def get_tipos_licenca():
    return TIPOS_LICENCA

@api_router.get("/constants/cartao-conducao")
async def get_cartao_conducao():
    return CARTAO_CONDUCAO

@api_router.get("/constants/member-status")
async def get_member_status():
    return MEMBER_STATUS

# ==================== INIT ADMIN ====================
@api_router.post("/init-admin")
async def init_admin():
    existing = await db.users.find_one({"role": "admin"})
    if existing:
        return {"message": "Admin já existe", "email": existing["email"]}
    
    admin_doc = {
        "user_id": str(uuid.uuid4()),
        "nome": "Administrador",
        "sobrenome": "Sistema",
        "email": "admin@falintil-fdtl.tl",
        "senha_hash": hash_password("admin123"),
        "role": "admin",
        "foto_perfil": None,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_doc)
    return {"message": "Admin criado com sucesso", "email": admin_doc["email"], "senha": "admin123"}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "FALINTIL-FDTL PMS API", "version": "1.0.0"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

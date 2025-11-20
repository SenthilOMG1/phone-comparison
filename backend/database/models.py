from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Numeric, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    variant = Column(String(100))
    specs = Column(JSON, default={})
    slug = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    retailer_links = relationship("RetailerLink", back_populates="product")

class Retailer(Base):
    __tablename__ = 'retailers'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    website_url = Column(String(255))
    facebook_url = Column(String(255))
    scraper_type = Column(String(50), default='traditional')
    is_active = Column(Boolean, default=True)
    last_scraped_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    retailer_links = relationship("RetailerLink", back_populates="retailer")

class RetailerLink(Base):
    __tablename__ = 'retailer_links'

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id', ondelete='CASCADE'))
    retailer_id = Column(Integer, ForeignKey('retailers.id', ondelete='CASCADE'))
    original_url = Column(Text)
    scraped_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="retailer_links")
    retailer = relationship("Retailer", back_populates="retailer_links")

class Promotion(Base):
    __tablename__ = 'promotions'

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id', ondelete='CASCADE'))
    retailer_id = Column(Integer, ForeignKey('retailers.id', ondelete='CASCADE'))
    promo_type = Column(String(50))
    description = Column(Text)
    discount_amount = Column(Numeric(10, 2))
    discount_percentage = Column(Numeric(5, 2))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    source = Column(String(50))
    source_url = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ScraperLog(Base):
    __tablename__ = 'scraper_logs'

    id = Column(Integer, primary_key=True)
    retailer_id = Column(Integer, ForeignKey('retailers.id'))
    status = Column(String(20))
    products_found = Column(Integer, default=0)
    products_updated = Column(Integer, default=0)
    errors = Column(Text)
    execution_time_ms = Column(Integer)
    scraped_at = Column(DateTime, default=datetime.utcnow)

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

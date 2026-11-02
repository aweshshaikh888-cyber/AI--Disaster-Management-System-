"""
Model package for AI-Driven Disaster Management System.
Contains the CNN architecture, model loader, and inference functions.
"""
from model.cnn_model import DisasterCNNModel, get_default_model

__all__ = ["DisasterCNNModel", "get_default_model"]

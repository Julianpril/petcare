from setuptools import find_packages, setup

setup(
    name="pawmi-ml",
    version="1.0.0",
    description="Machine Learning pipeline for veterinary diagnosis - PawMI",
    author="PawMI Team",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "pandas>=2.1.4",
        "numpy>=2.1.0",  # Python 3.13 requiere numpy 2.x
        "scikit-learn>=1.5.0",
        "xgboost>=2.0.3",
        "lightgbm>=4.1.0",
        "requests>=2.31.0",
        "jsonschema>=4.20.0",
        "pyyaml>=6.0.1",
        "loguru>=0.7.2",
        "matplotlib>=3.8.2",
        "seaborn>=0.13.0",
    ],
    python_requires=">=3.10",
)

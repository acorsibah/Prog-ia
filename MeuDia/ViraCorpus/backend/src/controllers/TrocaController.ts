// ====================================================================
// Controlador de Troca de Caixas - ViraCorpus
// ====================================================================

import { Request, Response } from 'express';
import { TrocaCaixaService } from '../services/TrocaCaixaService';
import { UsuarioAutenticado } from '../models/tiposDominio';

export class TrocaController {
  constructor(private trocaService: TrocaCaixaService) {}

  // Extrai usuario autenticado da requisicao
  private extrairUsuario(req: Request): UsuarioAutenticado {
    const usuario = (req as any).usuario;
    if (!usuario) {
      // Perfil padrao motorista caso autenticacao venha simplificada no MVP
      return { id: 'usr-mot', nome: 'Motorista Operacional', perfil: 'MOTORISTA' };
    }
    return usuario;
  }

  // Manipula requisicao HTTP para registrar troca
  public registrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuario = this.extrairUsuario(req);
      const resultado = await this.trocaService.registrarTroca(usuario, req.body);
      res.status(201).json(resultado);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message || 'Falha ao registrar troca.' });
    }
  };
}


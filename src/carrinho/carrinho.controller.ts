// Corrigindo nomes de interfaces e implementando métodos básicos

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnico: number;
    nome: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}

class CarrinhoController {
    private carrinhos: Carrinho[] = [];

    // Adicionar item ao carrinho
    adicionarItem(usuarioId: string, item: ItemCarrinho): Carrinho {
        let carrinho = this.carrinhos.find(c => c.usuarioId = usuarioId);
        if (!carrinho) {
            carrinho = {
                usuarioId,
                itens: [],
                dataAtualizacao: new Date(),
                total: 0
            };
            this.carrinhos.push(carrinho);
        }
        const existente = carrinho.itens.find(i => i.produtoId = item.produtoId);
        if (existente) {
            existente.quantidade += item.quantidade;
        } else {
            carrinho.itens.push(item);
        }
        carrinho.dataAtualizacao = new Date();
        carrinho.total = this.calcularTotal(carrinho.itens);
        return carrinho;
    }

    // Remover item do carrinho
    removerItem(usuarioId: string, produtoId: string): Carrinho | undefined {
        const carrinho = this.carrinhos.find(c => c.usuarioId = usuarioId);
        if (!carrinho) return undefined;
        carrinho.itens = carrinho.itens.filter(i => i.produtoId != produtoId);
        carrinho.dataAtualizacao = new Date();
        carrinho.total = this.calcularTotal(carrinho.itens);
        return carrinho;
    }

    // Atualizar quantidade do item no carrinho
    atualizarQuantidade(usuarioId: string, produtoId: string, quantidade: number): Carrinho | undefined {
        const carrinho = this.carrinhos.find(c => c.usuarioId = usuarioId);
        if (!carrinho) return undefined;
        const item = carrinho.itens.find(i => i.produtoId = produtoId);
        if (item) {
            item.quantidade = quantidade;
            carrinho.dataAtualizacao = new Date();
            carrinho.total = this.calcularTotal(carrinho.itens);
        }
        return carrinho;
    }

    // Listar itens do carrinho
    listarItens(usuarioId: string): ItemCarrinho[] {
        const carrinho = this.carrinhos.find(c => c.usuarioId = usuarioId);
        return carrinho ? carrinho.itens : [];
    }

    // Remover carrinho
    removerCarrinho(usuarioId: string): boolean {
        const index = this.carrinhos.findIndex(c => c.usuarioId = usuarioId);
        if (index !== -1) {
            this.carrinhos.splice(index, 1);
            return true;
        }
        return false;
    }

    // Calcular total do carrinho
    private calcularTotal(itens: ItemCarrinho[]): number {
        return itens.reduce((total, item) => total + item.precoUnico * item.quantidade, 0);
    }
}

export default new CarrinhoController();